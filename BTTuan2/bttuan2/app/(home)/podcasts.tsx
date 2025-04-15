// bttuan2/app/(home)/podcasts.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    Alert,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import * as api from '@/api/api';
import { ElementType, Podcast } from '@/utils/types/type';
import PeriodicTableWithFilter from '@/components/PeriodicTableWithFilter';

const cellSize = 50; // Kích thước ô (reuse from index.tsx)
const spacing = 1; // Khoảng cách giữa các ô (reuse from index.tsx)
const elements: ElementType[] = api.getElements(); // Fetch elements data

// Define a default image path (replace with your actual asset path)
// IMPORTANT: Make sure this path is correct and the image exists!
let DEFAULT_PODCAST_IMAGE: any;
try {
    // Use require for static assets
    DEFAULT_PODCAST_IMAGE = require('@/assets/images/podcast-placeholder.png');
} catch (e) {
    console.warn("Default podcast image not found at '@/assets/images/podcast-placeholder.png'. Using a placeholder view.");
    // Fallback component or style if image is missing
    DEFAULT_PODCAST_IMAGE = null; // Or provide a fallback component/style
}

export default function PodcastsScreen() {
    const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const clearSelection = () => {
        setSelectedElement(null);
        setPodcasts([]);
        setError(null);
    }

    // Effect to lock orientation (reused from index.tsx)
    useEffect(() => {
        const changeOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        };
        changeOrientation();
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        };
    }, []);

    const handleElementPressForPodcast = useCallback(async (element: ElementType) => {
        if (selectedElement?.atomic_number === element.atomic_number) {
            clearSelection();
            return;
        }

        setSelectedElement(element);
        setPodcasts([]);
        setError(null);
        setIsLoading(true);
        console.log(`Podcasts screen: Fetching podcasts for: ${element.name}`);

        try {
            const fetchedPodcasts = await api.fetchPodcastsByElement(element.name);
            console.log(`Fetched ${fetchedPodcasts.length} podcasts.`);
            if (fetchedPodcasts.length === 0) {
                setError(`No podcasts found for ${element.name}.`);
            }
            setPodcasts(fetchedPodcasts);
        } catch (err) {
            console.error("Error in handleElementPressForPodcast:", err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to load podcasts: ${message}`);
            Alert.alert('Error', `Could not load podcasts for ${element.name}. Please try again later.`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedElement]);

    const handlePodcastPress = (podcast: Podcast) => {
        console.log("Navigating to podcast detail:", podcast.id);
        router.push({
            pathname: '/(podcast)/[id]', // Make sure this path matches your file structure
            params: {
                id: podcast.id.toString(),
                title: podcast.title,
                audioUrl: podcast.audioUrl,
                transcript: podcast.transcript,
                elementName: podcast.element,
            },
        });
    };

    const renderPodcastItem = ({ item }: { item: Podcast }) => (
        <TouchableOpacity onPress={() => handlePodcastPress(item)} style={styles.podcastItem}>
             {DEFAULT_PODCAST_IMAGE ? (
                 <Image source={DEFAULT_PODCAST_IMAGE} style={styles.podcastImage} />
            ) : (
                 <View style={[styles.podcastImage, styles.podcastImageFallback]}><Text style={styles.podcastImageFallbackText}>?</Text></View>
            )}
            <View style={styles.podcastTextContainer}>
                <Text style={styles.podcastTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.podcastElement}>{item.element}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={styles.screen}>
            <View style={styles.tableContainer}>
                <PeriodicTableWithFilter 
                    onElementPress={handleElementPressForPodcast} 
                    selectedElementId={selectedElement?.atomic_number}
                />
            </View>

            <View style={styles.resultsContainer}>
                {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}
                {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
                {!isLoading && !error && selectedElement && podcasts.length > 0 && (
                    <>
                        <Text style={styles.resultsTitle}>Podcasts for {selectedElement.name}</Text>
                        <FlatList
                            data={podcasts}
                            renderItem={renderPodcastItem}
                            keyExtractor={(item) => item.id.toString()}
                            style={styles.podcastList}
                        />
                    </>
                )}
                 {!isLoading && !error && selectedElement && podcasts.length === 0 && (
                     <Text style={styles.infoText}>No podcasts found for {selectedElement.name}.</Text>
                 )}
                  {!isLoading && !error && !selectedElement && (
                      <Text style={styles.infoText}>Tap an element in the table above to find related podcasts.</Text>
                  )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    tableContainer: {
        flex: 3,
        overflow: 'hidden',
    },
    resultsContainer: {
        flex: 2,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#f9f9f9',
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'flex-start',
        paddingHorizontal: 5,
    },
    podcastList: {
        width: '100%',
    },
    podcastItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 4,
    },
    podcastImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
    },
     podcastImageFallback: {
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: '#ccc',
     },
     podcastImageFallbackText: {
         fontSize: 18,
         fontWeight: 'bold',
         color: '#666',
     },
    podcastTextContainer: {
        flex: 1,
    },
    podcastTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    podcastElement: {
        fontSize: 13,
        color: '#666',
    },
    loadingIndicator: {
         marginVertical: 20,
    },
    errorText: {
        marginVertical: 20,
        color: 'red',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontSize: 14,
    },
     infoText: {
         marginVertical: 20,
         color: '#555',
         textAlign: 'center',
         fontSize: 14,
         paddingHorizontal: 20,
     },
}); 