import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity, TextInput,
    SectionList,
    ActivityIndicator, Alert,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import * as api from '../../api/api';
import { useRouter } from 'expo-router';
import { UserProfile, FavoriteElement, FavoritePodcast, ViewedElement, ViewedPodcast, PaginatedResponse, ApiResponse } from '@/utils/types/type';

const DEFAULT_AVATAR = require('@/assets/images/default-avatar.png');
const PAGE_SIZE = 10;

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ListState<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore?: boolean;
}

interface ProfileSection<T> {
    key: string;
    title: string;
    data: T[];
    state: ListState<T>;
    fetcher: (page: number, size: number) => Promise<ApiResponse<PaginatedResponse<T>> | null>;
    setter: React.Dispatch<React.SetStateAction<ListState<T>>>;
    renderItem: ({ item }: { item: T }) => React.JSX.Element;
    emptyMessage: string;
}

export default function Profile() {
    const username = SecureStore.getItem("name");
    const avatarStored = SecureStore.getItem("avatar");
    const emailStored = SecureStore.getItem("email");
    const [name, setName] = useState("User name");
    const [email, setEmail] = useState("Email");
    const [isEditing, setIsEditing] = useState(false);
    const [avatar, setAvatar] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Male_Avatar.jpg/1200px-Male_Avatar.jpg');

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [localName, setLocalName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [pickedAvatarUri, setPickedAvatarUri] = useState<string | null>(null);

    const [favoriteElements, setFavoriteElements] = useState<ListState<FavoriteElement>>({ data: [], currentPage: 1, totalPages: 1, isLoading: false, isRefreshing: false });
    const [favoritePodcasts, setFavoritePodcasts] = useState<ListState<FavoritePodcast>>({ data: [], currentPage: 1, totalPages: 1, isLoading: false, isRefreshing: false });
    const [viewedElements, setViewedElements] = useState<ListState<ViewedElement>>({ data: [], currentPage: 1, totalPages: 1, isLoading: false, isRefreshing: false });
    const [viewedPodcasts, setViewedPodcasts] = useState<ListState<ViewedPodcast>>({ data: [], currentPage: 1, totalPages: 1, isLoading: false, isRefreshing: false });

    const [isRefreshingAll, setIsRefreshingAll] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        favElements: false,
        favPodcasts: true,
        viewedElements: true,
        viewedPodcasts: true,
    });

    const router = useRouter();

    useEffect(() => {
        if(username !== null) {
            setName(username);
        }
        if(avatarStored !== null) {
            setAvatar(avatarStored);
        }
        if(emailStored !== null) {
            setEmail(emailStored);
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        const response = await api.getUserProfile();
        if (response?.data) {
            setUserProfile(response.data);
            setLocalName(response.data.name || '');
        } else {
            Alert.alert("Error", "Could not fetch profile data.");
            setUserProfile(null);
        }
    }, []);

    const fetchListData = useCallback(async <T,>(
        fetcher: (page: number, size: number) => Promise<ApiResponse<PaginatedResponse<T>> | null>,
        setter: React.Dispatch<React.SetStateAction<ListState<T>>>,
        page: number = 1,
        isLoadingMore: boolean = false,
        isRefreshing: boolean = false
    ) => {
        setter(prev => ({
            ...prev,
            isLoading: !isLoadingMore && !isRefreshing,
            isRefreshing: isRefreshing,
            isLoadingMore: isLoadingMore ? true : prev.isLoadingMore
        }));

        try {
            const response = await fetcher(page, PAGE_SIZE);
            if (response?.data?.result) {
                setter(prev => ({
                    ...prev,
                    data: page === 1 ? response.data.result : [...prev.data, ...response.data.result],
                    currentPage: response.data.meta.current,
                    totalPages: response.data.meta.totalPages,
                }));
            } else if (page === 1) {
                setter(prev => ({ ...prev, data: [] }));
                console.warn(`No results found for ${fetcher.name} on page ${page}.`);
            } else {
                 console.warn(`Failed to fetch list data or no results found for ${fetcher.name} on page ${page}.`);
            }
        } catch (error) {
             console.error(`Error fetching list data for ${fetcher.name}:`, error);
             Alert.alert("Error", `Failed to fetch data. ${error}`);
        } finally {
             setter(prev => ({ ...prev, isLoading: false, isRefreshing: false, isLoadingMore: false }));
        }
    }, []);

    const loadMore = useCallback(<T,>(
        fetcher: (page: number, size: number) => Promise<ApiResponse<PaginatedResponse<T>> | null>,
        state: ListState<T>,
        setter: React.Dispatch<React.SetStateAction<ListState<T>>>
    ) => {
        if (!state.isLoading && !state.isRefreshing && !state.isLoadingMore && state.currentPage < state.totalPages) {
            fetchListData(fetcher, setter, state.currentPage + 1, true);
        }
    }, [fetchListData]);

    const handleGlobalRefresh = useCallback(async () => {
        setIsRefreshingAll(true);
        await Promise.all([
            fetchProfile(),
            fetchListData(api.getFavoriteElements, setFavoriteElements, 1, false, true),
            fetchListData(api.getFavoritePodcasts, setFavoritePodcasts, 1, false, true),
            fetchListData(api.getViewedElements, setViewedElements, 1, false, true),
            fetchListData(api.getViewedPodcasts, setViewedPodcasts, 1, false, true),
        ]);
        setIsRefreshingAll(false);
    }, [fetchProfile, fetchListData]);

    useEffect(() => {
        fetchProfile();
        fetchListData(api.getFavoriteElements, setFavoriteElements);
        fetchListData(api.getFavoritePodcasts, setFavoritePodcasts);
        fetchListData(api.getViewedElements, setViewedElements);
        fetchListData(api.getViewedPodcasts, setViewedPodcasts);
    }, [fetchProfile, fetchListData]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPickedAvatarUri(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageUri: string) => {
        try {
            let formData = new FormData();
            formData.append('file', { uri: imageUri, name: `${imageUri.split(".")[1]}.jpg`, type: 'image/jpeg' } as any);
            formData.append('upload_preset', process.env.EXPO_PUBLIC_UPLOAD_PRESET || '');
            
            let response = await fetch(process.env.EXPO_PUBLIC_CLOUDINARY_URL || '', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            let data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };

    const handleConfirmEdit = async () => {
        let imageUrl = userProfile?.avatar;

        if (pickedAvatarUri) {
            const uploadedUrl = await uploadImage(pickedAvatarUri);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
                setPickedAvatarUri(null);
            } else {
                Alert.alert("Error", "Image upload failed. Profile not updated.");
                return;
            }
        }

        if (localName !== userProfile?.name || imageUrl !== userProfile?.avatar) {
             const response = await api.editUser(localName, imageUrl || '');
             if (response?.data) {
                 Alert.alert("Success", "Profile updated successfully!");
                 await fetchProfile();
                 setIsEditingName(false);
             } else {
                 Alert.alert("Error", "Failed to update profile.");
             }
        } else {
            setIsEditingName(false);
            Alert.alert("Info", "No changes detected.");
        }
    };

    const handleEditEmail = () => {
        router.push("/(edit-email)");
    };

    const handleCancelEditName = () => {
        setIsEditingName(false);
        setLocalName(userProfile?.name || '');
    };

    const navigateToElement = (elementId: number) => {
        router.push(`/(element)/${elementId}`);
    };

    const navigateToPodcast = (podcastId: number, title?: string, elementName?: string) => {
        router.push({
            pathname: `/(podcast)/[id]` as `/(podcast)/[id]`,
            params: { id: String(podcastId), title, elementName },
        });
    };

    const renderEmptyListComponent = (message: string) => (
        <View style={styles.emptyListContainer}>
            <Ionicons name="information-circle-outline" size={30} color="#aaa" />
            <Text style={styles.emptyListText}>{message}</Text>
        </View>
    );

    const renderFavoriteElementItem = ({ item }: { item: FavoriteElement }) => (
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigateToElement(item.elementId)}>
            <View style={styles.listItemContainer}>
                 <Image source={typeof item.image === 'string' ? { uri: item.image } : DEFAULT_AVATAR} style={styles.itemImage} />
                 <View style={styles.itemTextContainer}>
                    <Text style={styles.itemName}>{item.elementName} ({item.symbol})</Text>
                 </View>
                 <Ionicons name="heart" size={20} color="#ff6b6b" />
            </View>
        </TouchableOpacity>
    );

    const renderFavoritePodcastItem = ({ item }: { item: FavoritePodcast }) => (
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigateToPodcast(item.podcastId, item.title, item.elementName)}>
            <View style={styles.listItemContainer}>
                 <MaterialIcons name="headset" size={30} color="#4a90e2" style={styles.itemIcon} />
                 <View style={styles.itemTextContainer}>
                     <Text style={styles.itemName}>{item.title}</Text>
                     <Text style={styles.itemSubtitle}>{item.elementName}</Text>
                 </View>
                 <Ionicons name="heart" size={20} color="#ff6b6b" />
            </View>
        </TouchableOpacity>
    );

    const renderViewedElementItem = ({ item }: { item: ViewedElement }) => (
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigateToElement(item.elementId)}>
            <View style={styles.listItemContainer}>
                 <Image source={typeof item.image === 'string' ? { uri: item.image } : DEFAULT_AVATAR} style={styles.itemImage} />
                 <View style={styles.itemTextContainer}>
                     <Text style={styles.itemName}>{item.elementName} ({item.symbol})</Text>
                     <Text style={styles.itemSubtitle}>Last viewed: {new Date(item.lastSeen).toLocaleDateString()}</Text>
                 </View>
                 <Ionicons name="eye-outline" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

     const renderViewedPodcastItem = ({ item }: { item: ViewedPodcast }) => (
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigateToPodcast(item.podcastId, item.title, item.elementName)}>
            <View style={styles.listItemContainer}>
                 <MaterialIcons name="headset" size={30} color="#4a90e2" style={styles.itemIcon} />
                 <View style={styles.itemTextContainer}>
                     <Text style={styles.itemName}>{item.title}</Text>
                     <Text style={styles.itemSubtitle}>Element: {item.elementName}</Text>
                     <Text style={styles.itemSubtitle}>Last viewed: {new Date(item.lastSeen).toLocaleDateString()}</Text>
                 </View>
                 <Ionicons name="eye-outline" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View style={styles.headerCard}>
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarTouchable}>
                    <Image
                         source={pickedAvatarUri ? { uri: pickedAvatarUri } : (userProfile?.avatar ? { uri: userProfile.avatar } : DEFAULT_AVATAR)}
                         style={styles.avatar}
                         onError={(e) => console.log("Failed to load avatar:", e.nativeEvent.error)}
                    />
                    <View style={styles.editIconOverlay}>
                        <AntDesign name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <View style={styles.userInfoContainer}>
                     <View style={styles.nameContainer}>
                        {isEditingName ? (
                            <TextInput
                                style={[styles.name, styles.input]}
                                value={localName}
                                onChangeText={setLocalName}
                                autoFocus
                                placeholder="Enter your name"
                                placeholderTextColor="#aaa"
                            />
                        ) : (
                             <Text style={styles.name} numberOfLines={1}>{localName || 'User Name'}</Text>
                        )}
                         {!isEditingName && (
                            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.inlineEditIcon}>
                                <MaterialIcons name="edit" size={20} color="#888" />
                            </TouchableOpacity>
                         )}
                    </View>

                    <View style={styles.emailContainer}>
                        <MaterialIcons name="email" size={16} color="#888" style={{ marginRight: 5 }} />
                        <Text style={styles.email}>{userProfile?.email || 'Email'}</Text>
                        <TouchableOpacity onPress={handleEditEmail} style={styles.inlineEditIcon}>
                             <MaterialIcons name="edit" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {(isEditingName || pickedAvatarUri) && (
               <TouchableOpacity onPress={handleConfirmEdit} style={[styles.actionButton, styles.confirmButton]}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>Confirm Changes</Text>
               </TouchableOpacity>
            )}
            {isEditingName && (
                <TouchableOpacity onPress={handleCancelEditName} style={[styles.actionButton, styles.cancelButton]}>
                    <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const toggleSectionCollapse = (key: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderSectionHeader = ({ section }: { section: ProfileSection<any> }) => {
        const isCollapsed = collapsedSections[section.key];
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleSectionCollapse(section.key)}
                style={styles.sectionHeaderTouchable}
            >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons
                    name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                    size={24}
                    color="#555"
                />
            </TouchableOpacity>
        );
    };

    const renderSectionFooter = ({ section }: { section: ProfileSection<any> }) => {
        const { state, fetcher, setter, key } = section;
        if (collapsedSections[key]) {
            return null;
        }
        if (state.isLoadingMore) {
            return <ActivityIndicator style={styles.listFooter} size="small" color="#007AFF" />;
        }
        if (state.currentPage < state.totalPages) {
            return (
                <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => loadMore(fetcher, state, setter)}
                >
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                    <Ionicons name="arrow-down-circle-outline" size={18} color="#007AFF" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
            );
        }
        return <View style={styles.sectionFooterEnd} />;
    };

    const sections: ProfileSection<any>[] = [
        {
            key: 'favElements',
            title: "Favorite Elements",
            data: favoriteElements.data,
            state: favoriteElements,
            fetcher: api.getFavoriteElements,
            setter: setFavoriteElements,
            renderItem: renderFavoriteElementItem,
            emptyMessage: "You haven't favorited any elements yet."
        },
        {
            key: 'favPodcasts',
            title: "Favorite Podcasts",
            data: favoritePodcasts.data,
            state: favoritePodcasts,
            fetcher: api.getFavoritePodcasts,
            setter: setFavoritePodcasts,
            renderItem: renderFavoritePodcastItem,
            emptyMessage: "You haven't favorited any podcasts yet."
        },
        {
            key: 'viewedElements',
            title: "Recently Viewed Elements",
            data: viewedElements.data,
            state: viewedElements,
            fetcher: api.getViewedElements,
            setter: setViewedElements,
            renderItem: renderViewedElementItem,
            emptyMessage: "You haven't viewed any elements recently."
        },
        {
            key: 'viewedPodcasts',
            title: "Recently Viewed Podcasts",
            data: viewedPodcasts.data,
            state: viewedPodcasts,
            fetcher: api.getViewedPodcasts,
            setter: setViewedPodcasts,
            renderItem: renderViewedPodcastItem,
            emptyMessage: "You haven't viewed any podcasts recently."
        },
    ];

    if (!userProfile && favoriteElements.isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    return (
        <SectionList
            style={styles.sectionListStyle}
            contentContainerStyle={styles.container}
            sections={sections}
            keyExtractor={(item, index) => `${item.elementId || item.podcastId || item.title}-${index}`}
            ListHeaderComponent={ListHeader}
            renderItem={({ item, section }) => {
                if (collapsedSections[section.key]) {
                    return null;
                }
                if (section.state.data.length === 0 && !section.state.isLoading && !section.state.isRefreshing) {
                    return renderEmptyListComponent(section.emptyMessage);
                }
                return section.renderItem({ item });
            }}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionFooter}
            stickySectionHeadersEnabled={false}
            onRefresh={handleGlobalRefresh}
            refreshing={isRefreshingAll}
            ListEmptyComponent={null}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555'
    },
    sectionListStyle: {
         flex: 1,
         backgroundColor: '#f0f2f5',
    },
    container: {
        paddingBottom: 30,
        paddingHorizontal: 10,
    },
    headerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 5,
        marginTop: 15,
        marginBottom: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileHeader: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    avatarTouchable: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    editIconOverlay: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        padding: 8,
    },
    userInfoContainer: {
       alignItems: 'center',
       marginTop: 10,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        maxWidth: '90%',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '90%',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2c3e50',
        marginRight: 8,
        textAlign: 'center',
    },
    email: {
        fontSize: 15,
        color: '#7f8c8d',
        marginRight: 8,
        textAlign: 'center',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#007AFF',
        paddingBottom: 2,
        paddingHorizontal: 10,
        minWidth: 180,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: '#2c3e50',
    },
    inlineEditIcon: {
        paddingLeft: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#2ecc71',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    sectionHeaderTouchable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        marginTop: 15,
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34495e',
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        marginHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    itemImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 15,
        backgroundColor: '#ecf0f1',
    },
    itemIcon: {
         marginRight: 15,
         width: 45,
         textAlign: 'center',
         lineHeight: 45,
    },
    itemTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#34495e',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#95a5a6',
    },
    listFooter: {
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 5,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    loadMoreButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        marginHorizontal: 5,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
    },
    loadMoreButtonText: {
        color: '#007AFF',
        fontSize: 15,
        fontWeight: '500',
    },
    sectionFooterEnd: {
        height: 10,
        backgroundColor: '#ffffff',
        marginHorizontal: 5,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    emptyListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        marginHorizontal: 5,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        minHeight: 120,
    },
    emptyListText: {
        fontSize: 15,
        color: '#95a5a6',
        textAlign: 'center',
        marginTop: 10,
    },
    itemSeparator: {
    },
});
