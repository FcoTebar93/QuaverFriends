import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import PostCard from '../components/PostCard';
import storage from '@react-native-firebase/storage';

const ProfileScreen = ({ navigation, route }) => {
  const { user, logout } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [following, setFollowing] = useState(false);

  const fetchPosts = async () => {
    try {
      const list = [];

      await firestore()
        .collection('posts')
        .where('userId', '==', route.params ? route.params.userId : user.uid)
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
              userName: 'Test Name',
              userImg:
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
              postTime: postTime,
              post,
              postImg,
              liked: false,
              likes,
              comments,
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

  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(route.params ? route.params.userId : user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      })
  };

  const getFollowersCount = async () => {
    const userRef = firestore().collection('users').doc(route.params ? route.params.userId : user.uid);
    const snapshot = await userRef.get();
    const followers = snapshot.data().followers || [];
    setFollowersCount(followers.length);
    setFollowing(followers.includes(user.uid));
  };

  useEffect(() => {
    getUser();
    fetchPosts();
    navigation.addListener("focus", () => {
      setLoading(!loading);
      getFollowersCount();
    });
  }, [navigation, loading]);

  useEffect(() => {
    fetchPosts();
    setDeleted(false);
    getFollowersCount();
  }, [deleted]);

  const handleDelete = (postId) => {
    Alert.alert(
      'Delete post',
      'Are you sure you want to delete this post?',
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
      { cancelable: false },
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
        Alert.alert(
          'Post deleted',
          'Your post has been deleted successfully!',
        );
        setDeleted(true);
      })
      .catch((e) => console.log('Error deleting post.', e));
  };

  const handleFollow = async () => {
    const userRef = firestore().collection('users').doc(route.params ? route.params.userId : user.uid);
    const followers = userData.followers || [];
    const updatedFollowers = following
      ? followers.filter((followerId) => followerId !== user.uid)
      : [...followers, user.uid];
  
    try {
      await userRef.update({ followers: updatedFollowers });
      const updatedSnapshot = await userRef.get();
      const updatedFollowersCount = updatedSnapshot.data().followers.length;
  
      setFollowersCount(updatedFollowersCount);
      setFollowing(!following);
    } catch (e) {
      console.log('Error updating followers.', e);
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
        <View style={styles.userInfoSection}>
          <Image style={styles.userImg} source={{ uri: userData ? userData.userImg || '../assets/default-img.jpg' : '../assets/default-img.jpg' }} />
          <Text style={styles.userInfo}>{userData ? userData.fname || 'User' : 'User'}</Text>
          <Text style={styles.userInfo}>Grupo: {userData ? userData.lname || 'User' : 'User'}</Text>
          <Text style={styles.userInfo}>Genero: {userData ? userData.phone || 'User' : 'User'}</Text>
          <Text style={styles.userInfo}>País: {userData ? userData.country || 'User' : 'User'}</Text> 
          <Text style={styles.userInfo}>Ciudad: {userData ? userData.city || 'User' : 'User'}</Text>
          <Text style={styles.aboutUser}>{userData ? userData.about || 'No details added.' : ''}</Text>

          <View style={styles.infoButtonsContainer}>
            {route.params ? (
              <>
                <TouchableOpacity style={styles.userBtn} onPress={handleFollow}>
                  <Text style={styles.userBtnTxt}>{following ? 'Unfollow' : 'Follow'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.userBtn} onPress={() => { navigation.navigate('EditProfile'); }}>
                  <Text style={styles.userBtnTxt}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.userBtn} onPress={() => logout()}>
                  <Text style={styles.userBtnTxt}>Logout</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.sectionTitle}>{posts.length}</Text>
          <Text>Posts</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.sectionTitle}>{followersCount}</Text>
          <Text>Followers</Text>
        </View>

        <View style={styles.postsContainer}>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            posts.map((item) => (
              <PostCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onPress={() => navigation.navigate('HomeProfile', { userId: item.userId })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  userInfoSection: {
    paddingHorizontal: 10,
    marginBottom: 25,
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    marginTop: 10,
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 5
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '55%',

  },
  userBtn: {
    borderColor: '#333333',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  userBtnTxt: {
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  postsContainer: {
    marginTop: 20,
    paddingBottom: 50,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
});