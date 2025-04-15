import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Ionicons } from '@expo/vector-icons'; // Or any other icon library you use
import { getFavoriteStatus, toggleFavoriteStatus, getPodcastComments, addPodcastComment, editPodcastComment, likePodcastComment, recordPodcastView, getPodcastById } from '@/api/api'; // Use alias
import { Comment, PodcastDetail, ApiResponse } from '@/utils/types/type'; // Use alias and import ApiResponse here
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as SecureStore from 'expo-secure-store';

// Reuse the default image path logic from the podcasts list screen
let DEFAULT_PODCAST_IMAGE: any;
try {
    DEFAULT_PODCAST_IMAGE = require('@/assets/images/podcast-placeholder.png');
} catch (e) {
    console.warn("Default podcast image not found at '@/assets/images/podcast-placeholder.png'. Using a placeholder view.");
    DEFAULT_PODCAST_IMAGE = null; // Or provide a fallback component/style
}

const SKIP_DURATION_MS = 10000; // Skip 10 seconds (10000 milliseconds)
const TRANSCRIPT_PREVIEW_LENGTH = 250; // Characters to show initially
const { width } = Dimensions.get('window');

export default function PodcastDetailScreen() {
    const params = useLocalSearchParams<{
        id: string;
        title?: string;
        audioUrl?: string;
        transcript?: string;
        elementName?: string;
    }>();
    const router = useRouter();
    const podcastId = params.id ? Number(params.id) : null;

    // State for full podcast details (potentially fetched)
    const [podcastDetails, setPodcastDetails] = useState<PodcastDetail | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(true); // Loading state for fetching details
    const [detailsError, setDetailsError] = useState<string | null>(null);

    // Audio player state
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false); // Specific loading for audio
    const [audioError, setAudioError] = useState<string | null>(null);
    const [playbackStatus, setPlaybackStatus] = useState<any | null>(null);

    // Favorite state
    const [isFavorited, setIsFavorited] = useState(false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(true); // Loading fav status
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);

    // Comments state
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number>(0);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

    // Transcript state
    const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

    const currentUserName = SecureStore.getItem('name');

    // --- Fetching Full Podcast Details ---
    useEffect(() => {
        const fetchDetails = async () => {
            if (!podcastId) {
                setDetailsError("Invalid Podcast ID.");
                setDetailsLoading(false);
                return;
            }

            setDetailsLoading(true);
            setDetailsError(null);

            // Check if essential details are missing from params
            if (!params.audioUrl || !params.transcript) {
                console.log(`Fetching full details for podcast ID: ${podcastId} as some params were missing.`);
                const response = await getPodcastById(podcastId);
                if (response?.data) {
                    setPodcastDetails(response.data);
                    // Also pre-populate missing params if needed (though podcastDetails state is now primary)
                    if (!params.title) params.title = response.data.title;
                    if (!params.elementName) params.elementName = response.data.element;
                } else {
                    setDetailsError(response?.message || "Failed to fetch podcast details.");
                }
            } else {
                // Use details from params if all are present
                console.log(`Using details from params for podcast ID: ${podcastId}.`);
                setPodcastDetails({
                    id: podcastId,
                    title: params.title || 'Podcast',
                    audioUrl: params.audioUrl,
                    transcript: params.transcript || null,
                    element: params.elementName || 'Unknown Element',
                    active: true, // Assume active if details are passed
                });
            }
            setDetailsLoading(false);
        };

        fetchDetails();
    }, [podcastId]); // Depend only on podcastId

    // --- Audio Loading Logic ---
    async function loadSound() {
        const audioUrlToLoad = podcastDetails?.audioUrl;
        if (!audioUrlToLoad) {
            setAudioError('Audio URL is missing or details not loaded yet.');
            console.error('Audio URL missing for podcast ID:', podcastId);
            return;
        }
        if (sound) { // If sound exists, ensure it's for the correct URL
            const status = await sound.getStatusAsync();
            if (status.isLoaded && (status as any).uri === audioUrlToLoad) {
                 console.log("Sound already loaded for this URL.");
                 setPlaybackStatus(status);
                 setIsLoadingAudio(false); // Ensure loading indicator is off
                 return; // Don't reload if already loaded
            }
            // Unload previous sound if URL differs or if sound object exists but isn't loaded properly
             console.log('Unloading previous sound before loading new one...');
             await sound.unloadAsync();
             setSound(null);
             setIsPlaying(false);
             setPlaybackStatus(null);
        }

        setIsLoadingAudio(true);
        setAudioError(null);
        console.log('Loading Sound for:', audioUrlToLoad);
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            console.log('Creating new sound instance...');
            const { sound: newSound, status } = await Audio.Sound.createAsync(
               { uri: audioUrlToLoad },
               { shouldPlay: false }, // Start paused
               onPlaybackStatusUpdate
            );
            setSound(newSound);
            setPlaybackStatus(status); // Set initial status
            console.log('Sound loaded successfully');
        } catch (e) {
            console.error('Error loading sound:', e);
            setAudioError(`Failed to load audio: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
             setIsLoadingAudio(false);
        }
    }

    // Effect to load the sound when podcastDetails are available/updated
    useEffect(() => {
        if (podcastDetails?.audioUrl) {
            loadSound();
        }
        // Cleanup function
        return () => {
            if (sound) {
                console.log('Unloading Sound on component unmount/details change');
                sound.unloadAsync().catch(e => console.error("Error unloading sound during cleanup:", e));
                setSound(null); // Reset sound state
            }
        };
    }, [podcastDetails]); // Rerun when details (including audioUrl) change


    // --- Playback Status Update Handler (onPlaybackStatusUpdate remains the same) ---
    const onPlaybackStatusUpdate = (status: any) => {
        if (!status.isLoaded) {
            if (status.error) {
                console.error(`Playback Error: ${status.error}`);
                setAudioError(`Playback Error: ${status.error}`);
                setIsPlaying(false);
            }
            setPlaybackStatus(status);
            return;
        }
        setPlaybackStatus(status);
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish && !status.isLooping) {
            console.log('Playback finished');
            sound?.setPositionAsync(0);
            sound?.pauseAsync();
        }
    };

    // --- Favorite API Calls (fetchFavoriteStatus, toggleFavorite remain the same, use podcastId) ---
    async function fetchFavoriteStatus() {
        if (!podcastId) return;
        setIsFavoriteLoading(true);
        setFavoriteError(null);
        console.log(`Fetching favorite status for podcast ID: ${podcastId}`);
        try {
            const result = await getFavoriteStatus(String(podcastId)); // API expects string?
            console.log('Favorite status fetched:', result);
            if (result.statusCode === 200 && result.data) {
                setIsFavorited(result.data.active);
            } else {
                 console.warn('Unexpected API response structure for fav status:', result);
                 throw new Error(result.message || 'Unexpected response from server.');
            }
        } catch (e) {
            console.error('Error fetching favorite status:', e);
            setFavoriteError(`Failed to load favorite status. ${e instanceof Error ? e.message : ''}`);
        } finally {
            setIsFavoriteLoading(false);
        }
    }

    async function toggleFavorite() {
        if (!podcastId || isTogglingFavorite) return;
        setIsTogglingFavorite(true);
        setFavoriteError(null);
        const previousFavoriteState = isFavorited;
        setIsFavorited(!previousFavoriteState);
        console.log(`Optimistically toggled favorite to: ${!previousFavoriteState}`);
        try {
             const result = await toggleFavoriteStatus(String(podcastId)); // API expects string?
             console.log('Favorite status toggled successfully on server:', result);
             if (result.statusCode === 200 && result.data && result.data.active !== !previousFavoriteState) {
                 console.warn('Server state mismatch after toggle. Reverting UI.');
                 setIsFavorited(result.data.active);
                 setFavoriteError(result.message || 'State mismatch. Please try again.');
             } else if (result.statusCode !== 200) {
                 throw new Error(result.message || 'Server responded with non-200 status after toggle.');
             }
        } catch (e) {
            console.error('Error toggling favorite status:', e);
            setIsFavorited(previousFavoriteState);
            setFavoriteError(`Failed to update favorite. ${e instanceof Error ? e.message : ''}`);
            Alert.alert("Error", "Could not update favorite status. Please check your connection and try again.");
        } finally {
            setIsTogglingFavorite(false);
        }
    }

    // Effect to load favorite status
    useEffect(() => {
        if (podcastId) {
            fetchFavoriteStatus();
        }
    }, [podcastId]);

    // --- Playback Controls (handlePlayPause, handleRewind, handleFastForward remain the same, use podcastId) ---
    async function handlePlayPause() {
        if (!sound || !playbackStatus?.isLoaded || !podcastId) return;
        try {
            if (isPlaying) {
                console.log('Pausing Sound');
                await sound.pauseAsync();
            } else {
                console.log('Playing Sound');
                recordPodcastView(podcastId).then((response: ApiResponse<any> | null) => {
                    if (response) {
                        console.log(`View recorded for podcast ${podcastId}:`, response.message || 'Success');
                    }
                });
                await sound.playAsync();
            }
        } catch (e) {
            console.error("Error handling play/pause:", e);
            setAudioError("Could not play/pause audio.");
        }
    }

    async function handleRewind() {
        if (!sound || !playbackStatus?.isLoaded) return;
        const currentPosition = playbackStatus.positionMillis;
        const newPosition = Math.max(0, currentPosition - SKIP_DURATION_MS);
        console.log(`Rewinding to ${newPosition}ms`);
        try {
            await sound.setPositionAsync(newPosition);
        } catch (e) {
            console.error("Error rewinding:", e);
        }
    }

    async function handleFastForward() {
        if (!sound || !playbackStatus?.isLoaded) return;
        const currentPosition = playbackStatus.positionMillis;
        const duration = playbackStatus.durationMillis;
        if (duration === undefined) return;
        const newPosition = Math.min(duration, currentPosition + SKIP_DURATION_MS);
        console.log(`Fast Forwarding to ${newPosition}ms`);
        try {
            await sound.setPositionAsync(newPosition);
        } catch (e) {
            console.error("Error fast forwarding:", e);
        }
    }

    // --- Time Formatting (formatTime remains the same) ---
    const formatTime = (millis: number | undefined): string => {
        if (millis === undefined || isNaN(millis)) return '00:00';
        const totalSeconds = Math.floor(millis / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // --- Comments Logic (fetchComments, handleAddComment, handleEditComment, handleLikeComment, formatTimestamp remain the same, use podcastId) ---
    const fetchComments = async (page: number) => {
        if (!podcastId) return;
        setCommentsLoading(true);
        setCommentsError(null);
        try {
            const response = await getPodcastComments(podcastId, page);
            if (response.statusCode === 200 && response.data) {
                const newComments = response.data.result;
                setComments(prev => page === 1 ? newComments : [...prev, ...newComments]);
                setHasMoreComments(response.data.meta.currentPage < response.data.meta.totalPages);
            } else {
                setCommentsError('Failed to load comments.');
            }
        } catch (error) {
            setCommentsError('Error loading comments.');
            console.error(error);
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        if(podcastId) {
            fetchComments(1);
        }
    }, [podcastId]);

    const handleAddComment = async () => {
        if (!newCommentText.trim() || !podcastId) return;
        setIsSubmittingComment(true);
        try {
            const response = await addPodcastComment(newCommentText, podcastId);
            if (response.statusCode === 200 && response.data) {
                const newComment = response.data as unknown as Comment;
                setComments(prev => [newComment, ...prev]);
                setNewCommentText('');
            } else {
                setCommentsError(response.message || 'Failed to add comment.');
            }
        } catch (error: any) {
            setCommentsError(error.message || 'Error adding comment.');
            console.error(error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleEditComment = async () => {
        if (!editingCommentId || !editingCommentText.trim()) return;
        setIsEditingComment(true);
        try {
            const response = await editPodcastComment(editingCommentId, editingCommentText);
            if (response.statusCode === 200 && response.data) {
                const updatedComment = response.data as unknown as Comment;
                setComments(prev => prev.map(comment => comment.id === editingCommentId ? updatedComment : comment));
                setEditingCommentId(0);
                setEditingCommentText('');
            } else {
                setCommentsError(response.message || 'Failed to edit comment.');
            }
        } catch (error: any) {
            if (error.message.includes('permission')) {
                setCommentsError('You do not have permission to edit this comment.');
            } else {
                setCommentsError(error.message || 'Error editing comment.');
            }
            console.error(error);
        } finally {
            setIsEditingComment(false);
        }
    };

    const handleLikeComment = async (commentId: number) => {
        if (likedComments.has(commentId)) return;
        setComments(prev => prev.map(comment => comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment));
        setLikedComments(prev => new Set(prev).add(commentId));
        try {
            const response = await likePodcastComment(commentId);
            if (response.statusCode !== 200) {
                console.error("Failed to like comment on server:", response.message);
                setComments(prev => prev.map(comment => comment.id === commentId ? { ...comment, likes: comment.likes - 1 } : comment));
                setLikedComments(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(commentId);
                    return newSet;
                });
                setCommentsError('Failed to sync like with server.');
            }
        } catch (error: any) {
            console.error("Error liking comment:", error);
            setComments(prev => prev.map(comment => comment.id === commentId ? { ...comment, likes: comment.likes - 1 } : comment));
            setLikedComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
            setCommentsError(error.message || 'Error liking comment.');
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 24) {
            return formatDistanceToNow(date, { addSuffix: true, locale: vi });
        } else {
            return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    // --- Render Logic ---
    if (!podcastId) {
        return (
            <View style={styles.errorContainerCentered}>
                <Text style={styles.errorText}>Podcast ID is missing.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
                    <Text style={styles.goBackButtonText}>Go Back</Text>
                 </TouchableOpacity>
            </View>
        );
    }

    if (detailsLoading) {
         return (
             <View style={styles.errorContainerCentered}>
                 <ActivityIndicator size="large" color={colors.primary} />
                 <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading Details...</Text>
             </View>
         );
     }

     if (detailsError) {
         return (
             <View style={styles.errorContainerCentered}>
                 <Ionicons name="warning-outline" size={40} color={colors.error} />
                 <Text style={styles.errorText}>{detailsError}</Text>
                 <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
                     <Text style={styles.goBackButtonText}>Go Back</Text>
                 </TouchableOpacity>
             </View>
         );
     }

    // Use details from fetched state
    const displayTitle = podcastDetails?.title ?? 'Podcast';
    const displayElementName = podcastDetails?.element;
    const displayTranscript = podcastDetails?.transcript;
    const currentPosition = playbackStatus?.positionMillis;
    const totalDuration = playbackStatus?.durationMillis;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Update Stack title dynamically */}
            <Stack.Screen options={{ title: displayTitle, headerBackTitle: '' }} />

            {/* --- Hero Section --- */}
            <View style={styles.heroSection}>
                 {/* ... Image ... */}
                 <View style={styles.imageContainer}>
                     {DEFAULT_PODCAST_IMAGE ? (
                         <Image source={DEFAULT_PODCAST_IMAGE} style={styles.image} resizeMode="cover"/>
                      ) : (
                          <View style={[styles.image, styles.imageFallback]}><Text style={styles.imageFallbackText}>?</Text></View>
                     )}
                  </View>
                  {/* ... Text & Favorite Button ... */}
                 <View style={styles.heroTextContainer}>
                    <Text style={styles.title}>{displayTitle}</Text>
                    {displayElementName && <Text style={styles.elementName}>Element: {displayElementName}</Text>}
                 </View>
                 <TouchableOpacity
                    onPress={toggleFavorite}
                    disabled={isFavoriteLoading || isTogglingFavorite}
                    style={styles.favoriteButtonHero}
                >
                    {/* ... Favorite icon logic ... */}
                    {isFavoriteLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons
                            name={isFavorited ? 'heart' : 'heart-outline'}
                            size={30}
                            color={isFavorited ? colors.favoriteActive : colors.favoriteInactive}
                        />
                    )}
                 </TouchableOpacity>
                 {favoriteError && <Text style={[styles.errorTextSmall, styles.favoriteErrorHero]}>{favoriteError}</Text>}
            </View>

            {/* --- Audio Player Section --- */}
            <View style={styles.playerCard}>
                {isLoadingAudio && <ActivityIndicator size="large" color={colors.primary} style={styles.playerLoadingIndicator} />}
                {!isLoadingAudio && audioError && <Text style={[styles.errorText, { marginBottom: 15 }]}>{audioError}</Text>}
                {!isLoadingAudio && !audioError && sound && playbackStatus?.isLoaded && (
                    <View style={styles.playerControlsContainer}>
                        {/* Time Display */}
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
                            <Text style={styles.timeText}> / </Text>
                            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
                        </View>
                        {/* TODO: Add Progress Bar/Slider here */}

                        {/* Control Buttons */}
                        <View style={styles.controlsRow}>
                            <TouchableOpacity onPress={handleRewind} style={styles.controlButton}>
                                <Ionicons name="play-back" size={32} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
                                 <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={60} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleFastForward} style={styles.controlButton}>
                                <Ionicons name="play-forward" size={32} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {!isLoadingAudio && !audioError && (!sound || !playbackStatus?.isLoaded) && (
                    <Text style={styles.infoText}>
                        {podcastDetails?.audioUrl ? 'Audio loading or unavailable.' : 'No audio available for this podcast.'}
                    </Text>
                )}
            </View>

            {/* --- Content Section (Transcript & Comments) --- */}
            <View style={styles.contentSection}>
                {/* Transcript Section */}
                <View style={styles.transcriptCard}>
                    <Text style={styles.sectionTitle}>Transcript</Text>
                    {displayTranscript ? (
                        <>
                            <Text style={styles.transcriptText} numberOfLines={isTranscriptExpanded ? undefined : 8}>
                                {displayTranscript}
                            </Text>
                            {displayTranscript.length > TRANSCRIPT_PREVIEW_LENGTH && (
                                <TouchableOpacity onPress={() => setIsTranscriptExpanded(!isTranscriptExpanded)} style={styles.showMoreButton}>
                                    <Text style={styles.showMoreButtonText}>{isTranscriptExpanded ? 'Show Less' : 'Show More'}</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <Text style={styles.infoText}>No transcript available.</Text>
                    )}
                </View>

                {/* Comment Section */}
                <View style={styles.commentsCard}>
                    {/* ... Comment section title, error display ... */}
                    <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
                    {commentsError && <Text style={styles.errorText}>{commentsError}</Text>}

                    {/* Add Comment Input */}
                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a public comment..."
                            placeholderTextColor={colors.textSecondary}
                            value={newCommentText}
                            onChangeText={setNewCommentText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.submitCommentButton, (!newCommentText.trim() || isSubmittingComment) && styles.submitCommentButtonDisabled]}
                            onPress={handleAddComment}
                            disabled={isSubmittingComment || !newCommentText.trim()}
                        >
                            {/* ... Submit button icon/indicator ... */}
                            {isSubmittingComment ? (
                                <ActivityIndicator size="small" color={colors.background} />
                            ) : (
                                <Ionicons name="send" size={20} color={colors.background} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    {commentsLoading && commentPage === 1 ? (
                        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
                    ) : comments.length === 0 && !commentsLoading ? (
                        <Text style={styles.emptyText}>Be the first to comment!</Text>
                    ) : (
                        <View style={styles.commentsList}>
                            {comments.map((comment) => (
                                <View key={comment.id} style={styles.commentItem}>
                                    {/* ... Avatar ... */}
                                    <Image
                                        source={comment.userAvatar ? { uri: comment.userAvatar } : require('@/assets/images/default-avatar.png')}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.commentContentContainer}>
                                        {/* ... Header (username, timestamp, edit button) ... */}
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.userName}>{comment.userName}</Text>
                                            <Text style={styles.timestamp}>{formatTimestamp(comment.createdAt)}</Text>
                                            {comment.userName === currentUserName && editingCommentId !== comment.id && (
                                                <TouchableOpacity
                                                    style={styles.commentActionButton}
                                                    onPress={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditingCommentText(comment.content);
                                                    }}
                                                >
                                                    <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {/* ... Content/Editing Input ... */}
                                        {editingCommentId === comment.id ? (
                                            <View style={styles.editCommentContainer}>
                                                <TextInput
                                                    style={styles.editCommentInput}
                                                    value={editingCommentText}
                                                    onChangeText={setEditingCommentText}
                                                    placeholderTextColor={colors.textSecondary}
                                                    multiline
                                                    autoFocus
                                                />
                                                <View style={styles.editButtonsRow}>
                                                    <TouchableOpacity
                                                        style={[styles.editButtonAction, styles.cancelButton]}
                                                        onPress={() => {
                                                            setEditingCommentId(0);
                                                            setEditingCommentText('');
                                                        }}
                                                    >
                                                        <Text style={styles.editButtonText}>Cancel</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.editButtonAction, styles.saveButton, isEditingComment && styles.submitCommentButtonDisabled]}
                                                        onPress={handleEditComment}
                                                        disabled={isEditingComment || !editingCommentText.trim()}
                                                    >
                                                        {isEditingComment ? (
                                                            <ActivityIndicator size="small" color={colors.background} />
                                                        ) : (
                                                            <Text style={styles.editButtonText}>Save</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <Text style={styles.commentContent}>{comment.content}</Text>
                                        )}
                                        {/* ... Footer (Like button) ... */}
                                        {editingCommentId !== comment.id && (
                                            <View style={styles.commentFooter}>
                                                <TouchableOpacity
                                                    style={styles.likeButton}
                                                    onPress={() => handleLikeComment(comment.id)}
                                                >
                                                    <Ionicons
                                                        name={likedComments.has(comment.id) ? 'heart' : 'heart-outline'}
                                                        size={20}
                                                        color={likedComments.has(comment.id) ? colors.favoriteActive : colors.textSecondary}
                                                    />
                                                    <Text style={styles.likeCount}>{comment.likes > 0 ? comment.likes : ''}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Load More Button / Indicator */}
                    {commentsLoading && commentPage > 1 && (
                         <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 15 }} />
                    )}
                    {hasMoreComments && !commentsLoading && comments.length > 0 && (
                        <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={() => {
                                const nextPage = commentPage + 1;
                                setCommentPage(nextPage);
                                fetchComments(nextPage);
                            }}
                        >
                            <Text style={styles.loadMoreButtonText}>Load More Comments</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

// --- Styles (remain largely the same) ---
const colors = {
    primary: '#007AFF', // Apple Blue
    background: '#F2F2F7', // Light Gray
    cardBackground: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#6E6E73',
    textLight: '#FFFFFF',
    divider: '#E5E5EA',
    favoriteActive: '#FF3B30', // Red
    favoriteInactive: '#AEAEB2',
    error: '#FF3B30',
    buttonDisabled: '#AEAEB2',
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    errorContainerCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    goBackButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    goBackButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '500',
    },
    // --- Hero Section ---
    heroSection: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 15,
        paddingTop: 10,
        position: 'relative', // For absolute positioning favorite error
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: width * 0.2, // Make image larger
        aspectRatio: 1,
        borderRadius: (width * 0.5) / 2, // Make it circular
        overflow: 'hidden', // Clip image to circle
        marginBottom: 15,
        backgroundColor: colors.divider, // Placeholder color
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.divider,
    },
    imageFallbackText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    heroTextContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    elementName: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    favoriteButtonHero: {
        position: 'absolute',
        top: 15, 
        right: 15,
        padding: 5,
    },
    favoriteErrorHero: {
        position: 'absolute',
        bottom: -10, // Position below the card slightly
        left: 20,
        right: 20,
        textAlign: 'center',
    },
    errorText: { // General error text
        color: colors.error,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 15,
    },
    errorTextSmall: { // Smaller error text for favorite status
        color: colors.error,
        fontSize: 12,
        marginTop: 5,
    },

    // --- Card Base ---
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    // --- Player Section ---
    playerCard: {
        // Use card styles
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        paddingVertical: 20, 
        paddingHorizontal: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    playerLoadingIndicator: {
        marginVertical: 20,
    },
    playerControlsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Push times to edges (if progress bar added)
        width: '90%', // Match approx width of controls row
        marginBottom: 10,
        marginTop: 5,
    },
    timeText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '90%',
        marginVertical: 10,
    },
    controlButton: {
        padding: 10, // Increase tap area
    },
    infoText: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    },

    // --- Content Section ---
    contentSection: {
        // Container for transcript and comments
    },
    sectionTitle: { 
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 15,
    },

    // --- Transcript Section ---
    transcriptCard: {
        // Use card styles
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    transcriptText: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.textPrimary,
    },
    showMoreButton: {
        marginTop: 10,
        paddingVertical: 5,
    },
    showMoreButtonText: {
        color: colors.primary,
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 15,
    },

    // --- Comments Section ---
    commentsCard: {
        // Use card styles
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        marginTop: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.background, // Slightly different background for input
        borderRadius: 20, // Pill shape
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 16,
        color: colors.textPrimary,
        minHeight: 40,
        maxHeight: 100, // Limit multiline expansion
    },
    submitCommentButton: {
        backgroundColor: colors.primary,
        borderRadius: 18, // Circular
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitCommentButtonDisabled: {
        backgroundColor: colors.buttonDisabled,
    },
    loadingIndicator: {
        marginVertical: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginVertical: 20,
        fontSize: 15,
    },
    commentsList: {
        // No extra style needed, padding handled by card
    },
    commentItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: colors.divider, // Placeholder
    },
    commentContentContainer: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontWeight: '600', // Semi-bold username
        fontSize: 15,
        color: colors.textPrimary,
        marginRight: 8,
    },
    timestamp: {
        color: colors.textSecondary,
        fontSize: 13,
        flexShrink: 1, // Allow timestamp to shrink if needed
    },
    commentActionButton: {
        marginLeft: 'auto', // Push edit/delete to the right
        padding: 4,
    },
    commentContent: {
        fontSize: 15,
        lineHeight: 21,
        color: colors.textPrimary,
    },
    commentFooter: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15, // Space between like and reply
    },
    likeCount: {
        marginLeft: 6,
        color: colors.textSecondary,
        fontSize: 14,
    },
    // --- Editing Comment Styles ---
    editCommentContainer: {
        marginTop: 4, // Space between header and input when editing
    },
    editCommentInput: {
        backgroundColor: colors.background, 
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 8,
        minHeight: 40,
        textAlignVertical: 'top', // Align text top for multiline
    },
    editButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    editButtonAction: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginLeft: 8,
    },
    editButtonText: {
        color: colors.textLight,
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: colors.textSecondary, 
    },
    saveButton: {
        backgroundColor: colors.primary,
    },

    // --- Load More Button ---
    loadMoreButton: {
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 15,
        borderTopWidth: 1, // Separate from last comment
        borderTopColor: colors.divider,
    },
    loadMoreButtonText: {
        color: colors.primary,
        fontWeight: '500',
        fontSize: 15,
    },
}); 