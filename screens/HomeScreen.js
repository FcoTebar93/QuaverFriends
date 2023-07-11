import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  SafeAreaView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Container } from '../styles/feedStyle';
import PostCard from '../components/PostCard';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    try {
      const list = [];

      await firestore()
        .collection('posts')
        .orderBy('postTime', 'desc')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const {
              userId,
              post,
              postImg,
              postTime,
              likes,
              comments,
            } = doc.data();
            list.push({
              id: doc.id,
              userId,
              userName: 'Mehwish',
              userImg:
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
              postTime: postTime,
              post,
              postImg,
              liked: false,
              likes,
              comments,
              commentText: '', // Initialize comment text for each post
            });
          });
        });

      setPosts(list);

      if (loading) {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchPosts();
    navigation.addListener('focus', () => setLoading(!loading));
  }, [navigation, loading]);

  useEffect(() => {
    fetchPosts();
    setDeleted(false);
  }, [deleted]);

  const handleDelete = (postId) => {
    Alert.alert(
      'Borrar post',
      'Estás seguro de que quieres borrarlo?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed!'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => deletePost(postId),
        },
      ],
      { cancelable: false }
    );
  };

  const deletePost = (postId) => {
    console.log('Current Post Id: ', postId);

    firestore()
      .collection('posts')
      .doc(postId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          const { postImg } = documentSnapshot.data();

          if (postImg != null) {
            const storageRef = storage().refFromURL(postImg);
            const imageRef = storage().ref(storageRef.fullPath);

            imageRef
              .delete()
              .then(() => {
                console.log(`${postImg} has been deleted successfully.`);
                deleteFirestoreData(postId);
              })
              .catch((e) => {
                console.log('Error while deleting the image. ', e);
              });
          } else {
            deleteFirestoreData(postId);
          }
        }
      });
  };

  const deleteFirestoreData = (postId) => {
    firestore()
      .collection('posts')
      .doc(postId)
      .delete()
      .then(() => {
        Alert.alert('Post borrado', 'Tu post ha sido borrado con éxito!');
        setDeleted(true);
      })
      .catch((e) => console.log('Error deleting post.', e));
  };

  const handleAddComment = (postId, commentText) => {
    if (commentText.trim() === '') {
      return;
    }

    firestore()
      .collection('posts')
      .doc(postId)
      .update({
        comments: firestore.FieldValue.increment(1),
        commentText: '', // Clear comment text input after adding comment
      })
      .then(() => {
        fetchPosts(); // Refresh the posts after adding a comment
      })
      .catch((e) => console.log('Error adding comment.', e));
  };

  const ListHeader = () => {
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {/* Skeleton loading UI */}
        </ScrollView>
      ) : (
        <Container>
          <FlatList
            data={posts}
            renderItem={({ item }) => (
              <PostCard
                item={item}
                onDelete={handleDelete}
                onPress={() =>
                  navigation.navigate('Profile', { userId: item.userId })
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={{ flex: 1, marginRight: 10 }}
                    placeholder="Add a comment..."
                    value={item.commentText}
                    onChangeText={(text) => {
                      const updatedPosts = [...posts];
                      const postIndex = updatedPosts.findIndex(
                        (p) => p.id === item.id
                      );
                      if (postIndex !== -1) {
                        updatedPosts[postIndex].commentText = text;
                        setPosts(updatedPosts);
                      }
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleAddComment(item.id, item.commentText)}
                  >
                    <Ionicons name="send" size={24} color="blue" />
                  </TouchableOpacity>
                </View>
              </PostCard>
            )}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListHeader}
            showsVerticalScrollIndicator={false}
          />
        </Container>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;