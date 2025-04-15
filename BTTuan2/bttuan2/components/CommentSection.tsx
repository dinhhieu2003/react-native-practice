import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/api/api'; // Assuming api functions are correctly exported
import { Comment as PodcastComment, ElementComment } from '@/utils/types/type'; // Using specific types
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Define item types
type ItemType = 'podcast' | 'element';

// Define props for the component
interface CommentSectionProps {
    itemId: number; // ID of the podcast or element
    itemType: ItemType; // Type of item ('podcast' or 'element')
    loggedInUsername: string | null; // Current user's username for edit check
}

// Default Avatar Image (Consider moving to a constants file)
let DEFAULT_AVATAR_IMAGE: any;
try {
    DEFAULT_AVATAR_IMAGE = require('@/assets/images/default-avatar.png');
} catch (e) {
    console.warn("Default avatar image not found at '@/assets/images/default-avatar.png'.");
    DEFAULT_AVATAR_IMAGE = null;
}

// Colors (Consider moving to a constants file)
const colors = {
    primary: '#007AFF',
    background: '#F2F2F7',
    cardBackground: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#6E6E73',
    textLight: '#FFFFFF',
    divider: '#E5E5EA',
    favoriteActive: '#FF3B30',
    favoriteInactive: '#AEAEB2',
    error: '#FF3B30',
    buttonDisabled: '#AEAEB2',
};

// Generic Comment type for internal state
type GenericComment = Omit<PodcastComment, 'podcastTitle'> & Omit<ElementComment, 'elementName'> & { itemTitle?: string }; // Combine fields

const CommentSection: React.FC<CommentSectionProps> = ({ itemId, itemType, loggedInUsername }) => {
    // State variables copied and adapted
    const [comments, setComments] = useState<GenericComment[]>([]); // Use GenericComment
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [totalPages, setTotalPages] = useState(1); // Need total pages for pagination logic
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingComment, setEditingComment] = useState<GenericComment | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

    // Function to format timestamp (copied)
    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return "Invalid Date"; // Handle invalid date strings
            }
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            if (diffInHours < 24) {
                return formatDistanceToNow(date, { addSuffix: true, locale: vi });
            } else {
                return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
            }
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return "Date Error";
        }
    };

    // Generic API call functions
    const apiGetComments = itemType === 'podcast' ? api.getPodcastComments : api.getElementComments;
    const apiAddComment = itemType === 'podcast' ? api.addPodcastComment : api.addElementComment;
    const apiEditComment = itemType === 'podcast' ? api.editPodcastComment : api.editElementComment;
    const apiLikeComment = itemType === 'podcast' ? api.likePodcastComment : api.likeElementComment;

    // Fetch comments logic (adapted)
    const fetchComments = useCallback(async (pageToFetch: number, loadMore = false) => {
        if (!itemId) return;
        setCommentsLoading(!loadMore); // Show full loading only on initial load
        setCommentsError(null);

        try {
            // Type assertion needed as the function signature differs slightly (page vs current)
            const response = await (apiGetComments as any)(itemId, pageToFetch);

            if (response && !response.error && response.data) {
                const fetchedMeta = response.data.meta;
                const fetchedComments = response.data.result;

                // Adapt comments to GenericComment structure if needed (might not be necessary if fields align)
                const adaptedComments: GenericComment[] = fetchedComments.map((c: any) => ({ ...c }));

                setComments(prev => pageToFetch === 1 ? adaptedComments : [...prev, ...adaptedComments]);
                const currentPage = fetchedMeta.current ?? fetchedMeta.currentPage; // Handle both meta structures
                setCommentPage(currentPage);
                setTotalPages(fetchedMeta.totalPages);
                setHasMoreComments(currentPage < fetchedMeta.totalPages);
            } else {
                setCommentsError(response?.message || 'Failed to load comments.');
                if (pageToFetch === 1) setComments([]); // Clear only on initial load fail
            }
        } catch (error: any) {
            console.error(`Error loading ${itemType} comments:`, error);
            setCommentsError(error.message || 'Error loading comments.');
            if (pageToFetch === 1) setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    }, [itemId, itemType, apiGetComments]);

    // Load initial comments
    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]); // Depend on the memoized fetchComments

    // Handle load more
    const handleLoadMore = () => {
        if (!commentsLoading && hasMoreComments) {
            fetchComments(commentPage + 1, true);
        }
    };

    // Add comment logic (adapted)
    const handleAddComment = async () => {
        if (!newCommentText.trim() || !itemId || isSubmittingComment) return;
        setIsSubmittingComment(true);
        setCommentsError(null);
        try {
            // Type assertion needed as addElementComment expects number
            const response = await (apiAddComment as any)(newCommentText, itemId);
            if (response && !response.error && response.data) {
                 const newComment: GenericComment = { ...response.data };
                setComments(prev => [newComment, ...prev]);
                setNewCommentText('');
            } else {
                setCommentsError(response?.message || 'Failed to add comment.');
            }
        } catch (error: any) {
            setCommentsError(error.message || 'Error adding comment.');
            console.error(error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Edit comment logic (adapted)
    const handleInitiateEdit = (comment: GenericComment) => {
        setEditingComment(comment);
        setEditingCommentText(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditingCommentText('');
    };

    const handleSaveEdit = async () => {
        if (!editingComment || !editingCommentText.trim() || isSavingEdit) return;
        setIsSavingEdit(true);
        setCommentsError(null);

        const originalComment = comments.find(c => c.id === editingComment.id);
        if (!originalComment) return; // Should not happen

        const optimisticUpdate = { ...originalComment, content: editingCommentText.trim() };

        // Optimistic UI
        setComments(prev => prev.map(comment => comment.id === editingComment.id ? optimisticUpdate : comment));
        const commentToClose = editingComment; // Store ref before clearing state
        setEditingComment(null);
        setEditingCommentText('');

        try {
            const response = await apiEditComment(commentToClose.id, editingCommentText.trim());
            if (!response || response.error) {
                throw new Error(response?.message || 'Failed to save edit');
            }
            // Success - UI already updated
        } catch (error: any) {
            setCommentsError(error.message || 'Error saving comment edit.');
            console.error(error);
            // Revert optimistic update
            setComments(prev => prev.map(comment => comment.id === commentToClose.id ? originalComment : comment));
            // Optionally re-open editor:
            // setEditingComment(originalComment);
            // setEditingCommentText(originalComment.content);
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Like comment logic (adapted)
    const handleLikeComment = async (commentId: number) => {
        setCommentsError(null);

        const originalComment = comments.find(c => c.id === commentId);
        if (!originalComment) return;

        // Optimistic UI Update
        const optimisticLiked = !likedComments.has(commentId); // Tentative new state
        const likeChange = optimisticLiked ? 1 : (originalComment.likes > 0 ? -1 : 0); // Prevent negative likes on UI revert

        setLikedComments(prev => {
            const newSet = new Set(prev);
            if (optimisticLiked) {
                newSet.add(commentId);
            } else {
                newSet.delete(commentId);
            }
            return newSet;
        });
        setComments(prev => prev.map(comment =>
            comment.id === commentId ? { ...comment, likes: Math.max(0, comment.likes + likeChange) } : comment
        ));

        try {
            // Call API in the background
            const response = await apiLikeComment(commentId);
            if (response.statusCode !== 200) {
                 console.error(`Failed to ${optimisticLiked ? 'like' : 'unlike'} comment on server:`, response.message);
                 throw new Error(response.message || `Failed to ${optimisticLiked ? 'like' : 'unlike'} comment`);
            }
            // API Success, keep optimistic state
        } catch (error: any) {
             // Revert optimistic update on error
            console.error("Error liking comment:", error);
            setCommentsError(error.message || 'Error syncing like.');
            setLikedComments(prev => {
                 const newSet = new Set(prev);
                 if (optimisticLiked) {
                     newSet.delete(commentId); // Revert add
                 } else {
                     newSet.add(commentId); // Revert delete
                 }
                 return newSet;
             });
            setComments(prev => prev.map(comment => comment.id === commentId ? originalComment : comment)); // Restore original comment data
        }
    };

    // Render Comment Item function
    const renderCommentItem = ({ item }: { item: GenericComment }) => {
        const isEditingThis = editingComment?.id === item.id;
        // Use likedComments state for consistent like display
        const isLiked = likedComments.has(item.id);

        return (
            <View style={styles.commentItem}>
                 {isEditingThis ? (
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
                                 onPress={handleCancelEdit}
                                 disabled={isSavingEdit}
                             >
                                 <Text style={styles.editButtonText}>Cancel</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                 style={[styles.editButtonAction, styles.saveButton, (isSavingEdit || !editingCommentText.trim()) && styles.submitCommentButtonDisabled]}
                                 onPress={handleSaveEdit}
                                 disabled={isSavingEdit || !editingCommentText.trim()}
                             >
                                 {isSavingEdit ? (
                                     <ActivityIndicator size="small" color={colors.background} />
                                 ) : (
                                     <Text style={styles.editButtonText}>Save</Text>
                                 )}
                             </TouchableOpacity>
                         </View>
                     </View>
                 ) : (
                     <>
                         <Image
                             source={item.userAvatar ? { uri: item.userAvatar } : DEFAULT_AVATAR_IMAGE}
                             style={styles.avatar}
                             onError={(e) => console.log('Failed to load avatar:', e.nativeEvent.error)}
                         />
                         <View style={styles.commentContentContainer}>
                             <View style={styles.commentHeader}>
                                 <Text style={styles.userName}>{item.userName}</Text>
                                 <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
                                 {item.userName === loggedInUsername && (
                                     <TouchableOpacity
                                         style={styles.commentActionButton}
                                         onPress={() => handleInitiateEdit(item)}
                                     >
                                         <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                                     </TouchableOpacity>
                                 )}
                             </View>
                             <Text style={styles.commentContent}>{item.content}</Text>
                             <View style={styles.commentFooter}>
                                 <TouchableOpacity
                                     style={styles.likeButton}
                                     onPress={() => handleLikeComment(item.id)}
                                 >
                                     <Ionicons
                                         name={isLiked ? 'heart' : 'heart-outline'}
                                         size={20}
                                         color={isLiked ? colors.favoriteActive : colors.textSecondary}
                                     />
                                     <Text style={styles.likeCount}>{item.likes > 0 ? item.likes : ''}</Text>
                                 </TouchableOpacity>
                             </View>
                         </View>
                     </>
                 )}
             </View>
        );
    };

    return (
        <View style={styles.commentsCard}>
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
                     {isSubmittingComment ? (
                         <ActivityIndicator size="small" color={colors.background} />
                     ) : (
                         <Ionicons name="send" size={18} color={colors.background} />
                     )}
                 </TouchableOpacity>
            </View>

            {/* Comments List using FlatList */} 
            {commentsLoading && comments.length === 0 ? (
                 <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
            ) : !commentsLoading && comments.length === 0 && !commentsError ? (
                <Text style={styles.emptyText}>Be the first to comment!</Text>
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListFooterComponent={commentsLoading && comments.length > 0 ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 15 }} />
                    ) : null}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    style={styles.commentsListContainer} // Add style if needed for FlatList specific layout
                    // Note: Avoid nesting FlatList inside ScrollView if possible.
                    // If this component is inside a ScrollView, FlatList might not scroll correctly.
                    // Consider making the whole screen a FlatList or using SectionList.
                />
            )}
            {/* Removed manual mapping and Load More Button, handled by FlatList */} 
        </View>
    );
};

// Styles extracted and adapted
const styles = StyleSheet.create({
    commentsCard: {
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 15,
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 15,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        marginTop: 10,
        marginBottom: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 16,
        color: colors.textPrimary,
        minHeight: 40,
        maxHeight: 100,
    },
    submitCommentButton: {
        backgroundColor: colors.primary,
        borderRadius: 18,
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
    commentsListContainer: {
        // Add specific styles for FlatList if needed, e.g., maxHeight
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
        backgroundColor: colors.divider,
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
        fontWeight: '600',
        fontSize: 15,
        color: colors.textPrimary,
        marginRight: 8,
    },
    timestamp: {
        color: colors.textSecondary,
        fontSize: 13,
        flexShrink: 1,
    },
    commentActionButton: {
        marginLeft: 'auto',
        padding: 4,
    },
    commentContent: {
        fontSize: 15,
        lineHeight: 21,
        color: colors.textPrimary,
        marginTop: 4,
        marginBottom: 12,
    },
    commentFooter: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    likeCount: {
        marginLeft: 6,
        color: colors.textSecondary,
        fontSize: 14,
    },
    // Editing Comment Styles
    editCommentContainer: {
        flex: 1, // Occupy the space in the row when editing
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
        textAlignVertical: 'top',
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
});

export default CommentSection; 