import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import * as api from '../../api/api';
import * as formStyles from "../../styles/form";
import { useRouter } from 'expo-router';

export default function Profile() {
    const username = SecureStore.getItem("name");
    const avatarStored = SecureStore.getItem("avatar");
    const emailStored = SecureStore.getItem("email");
    const [name, setName] = useState("User name");
    const [email, setEmail] = useState("Email");
    const [isEditing, setIsEditing] = useState(false);
    const [avatar, setAvatar] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Male_Avatar.jpg/1200px-Male_Avatar.jpg');

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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
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
            console.log(data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };

    const handleConfirmEdit = async () => {
        const imageUrl = await uploadImage(avatar);
        if (!imageUrl) return;
        setAvatar(imageUrl);
        const response = await api.editUser(name, imageUrl);
        console.log(response);
    }

    const handleEditEmail = async () => {
        router.push("/(home)/edit-email");
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                <Image source={{ uri: avatar }} style={styles.avatar} />
                <AntDesign name="edit" size={20} color="black" style={styles.icon} />
            </TouchableOpacity>
            <View style={styles.nameContainer}>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                    />
                ) : (
                    <Text style={styles.name}>{name}</Text>
                )}
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <AntDesign name="edit" size={20} color="black" style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.nameContainer}>
                <Text style={styles.name}>{email}</Text>
                <TouchableOpacity onPress={handleEditEmail}>
                    <AntDesign name="edit" size={20} color="black" style={styles.icon} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleConfirmEdit}
                                style={formStyles.styles.button}>
                <Text style={formStyles.styles.buttonText}>Xác nhận chỉnh sửa</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    icon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 2,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 5,
    },
    input: {
        fontSize: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        marginRight: 5,
    },
});
