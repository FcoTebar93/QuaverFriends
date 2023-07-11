import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import {
  Container,
  Card,
  UserInfo,
  UserImg,
  UserName,
  UserInfoText,
  PostTime,
  PostText,
  PostImg,
  InteractionWrapper,
  Interaction,
  InteractionText,
  Divider,
} from '../styles/feedStyle';

import ProgressiveImage from './ProgressiveImage';

import { AuthContext } from '../navigation/AuthProvider';

const PostCard = ({ item, onDelete }) => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);
  const [commentUserData, setCommentUserData] = useState({});

  const [address, setAddress] = useState('');

  const getAddress = async () => {
    const snapshot = await firestore()
      .collection('posts')
      .doc(item.id)
      .get();

    if (snapshot.exists) {
      const postData = snapshot.data();
      const postAddress = postData.address;
      setAddress(postAddress);
    }
  };

  useEffect(() => {
    getUser();
    getComments();
    getAddress();
  }, []);

  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(item.userId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      });
  };

  const getCommentUser = async (commentUserId) => {
    if (commentUserData[commentUserId]) {
      // Si ya se ha obtenido el nombre del usuario del comentario, no es necesario hacer otra llamada a Firestore
      return;
    }

    await firestore()
      .collection('users')
      .doc(commentUserId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          const commentUserName = documentSnapshot.data().fname;
          console.log('Comment User Name', commentUserName);
          setCommentUserData((prevData) => ({
            ...prevData,
            [commentUserId]: commentUserName,
          }));
        }
      });
  };

  const getComments = async () => {
    const snapshot = await firestore()
      .collection('comments')
      .where('postId', '==', item.id)
      .orderBy('timestamp', 'desc')
      .get();

    const commentsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Obtener el nombre de usuario para cada comentario
    commentsData.forEach((comment) => {
      getCommentUser(comment.userId);
    });

    setComments(commentsData);
  };

  const handleAddComment = () => {
    if (commentInput.trim() === '') {
      return;
    }

    const commentData = {
      postId: item.id,
      userId: user.uid,
      commentText: commentInput.trim(),
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    firestore()
      .collection('comments')
      .add(commentData)
      .then(() => {
        console.log('Comentario agregado con éxito!');
        setCommentInput('');
      })
      .catch((error) => {
        console.log('Error al agregar el comentario: ', error);
      });
  };

  const navigation = useNavigation();

  const onPressUser = () => {
    navigation.navigate('Profile', { userId: item.userId });
  };

  return (
    <Card key={item.id}>
      {user.uid === item.userId && (
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6347" style={{ margin: 16 }} />
        </TouchableOpacity>
      )}
      <UserInfo>
        <UserImg
          source={
            userData
              ? { uri: userData.userImg || 'https://picsum.photos/50' }
              : require('../assets/default-img.jpg')
          }
        />
        <UserInfoText>
          <TouchableOpacity onPress={onPressUser}>
            <UserName>{userData ? userData.fname : 'Deleted'}</UserName>
          </TouchableOpacity>
          <PostTime>{moment(item.postTime.toDate()).fromNow()}</PostTime>
        </UserInfoText>
      </UserInfo>

      <PostText>{item.post}</PostText>
      <PostText>Localizacion:</PostText>
      {address !== '' && (
        <Text style={{ paddingHorizontal: 16, paddingBottom: 16 }}>{address}</Text>
      )}

      {item.postImg != null ? (
        <ProgressiveImage
          defaultImageSource={require('../assets/default-img.jpg')}
          source={{ uri: item.postImg }}
          style={{ width: '100%', height: 250 }}
          resizeMode="cover"
        />
      ) : (
        <Divider />
      )}

      {comments.map((comment) => (
        <View key={comment.id} style={{ paddingLeft: 16 }}>
          <UserInfo>
            <UserInfoText>
              <UserName>{commentUserData[comment.userId] || 'Anonymous'}</UserName>
              <PostTime>{moment(comment.timestamp.toDate()).fromNow()}</PostTime>
            </UserInfoText>
          </UserInfo>
          <PostText>{comment.commentText}</PostText>
          <Divider />
        </View>
      ))}

      <TextInput
        placeholder="Agrega un comentario..."
        value={commentInput}
        onChangeText={setCommentInput}
        style={{
          margin: 8,
          marginLeft: 20,
          marginRight: 20,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 8,
        }}
      />
      <TouchableOpacity onPress={handleAddComment} style={{ alignSelf: 'flex-end', margin: 16, marginBottom: 40 }}>
        <Ionicons name="send" size={24} color="#FF6347" />
      </TouchableOpacity>
    </Card>
  );
};

export default PostCard;