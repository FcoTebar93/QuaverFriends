import React, {useContext, useState, useEffect} from 'react';
import {View, Text,StyleSheet, Alert, ActivityIndicator} from 'react-native';
import{ InputField, InputWrapper, SubmitBtn, SubmitBtnText ,AddImage, StatusWrapper} from '../styles/AddPost';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

const AddPostScreen = () => {

  const { user, logout } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);
          
          if (
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            // Los permisos fueron otorgados
            Geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
              },
              (error) => {
                console.error(error);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
          } else {
            // Los permisos no fueron otorgados
            console.log('Permisos de ubicación no otorgados');
          }
        } else if (Platform.OS === 'ios') {
          const status = await Permissions.requestMultiple([
            Permissions.PERMISSIONS.IOS.ACCESS_FINE_LOCATION,
            Permissions.PERMISSIONS.IOS.ACCESS_COARSE_LOCATION,
          ]);
  
          if (
            status[Permissions.PERMISSIONS.IOS.ACCESS_FINE_LOCATION] === Permissions.RESULTS.GRANTED &&
            status[Permissions.PERMISSIONS.IOS.ACCESS_COARSE_LOCATION] === Permissions.RESULTS.GRANTED
          ) {
            // Los permisos fueron otorgados
            Geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
              },
              (error) => {
                console.error(error);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000,  enableHighAccuracy: true }
            );
          } else {
            // Los permisos no fueron otorgados
            console.log('Permisos de ubicación no otorgados');
            setAddress('');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (!location) {
      setAddress('');
      return;
    }
    if (location) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`
      )
        .then((response) => response.json())
        .then((data) => {
          const { address } = data;
          const { road, postcode, city, country } = address;
          const formattedAddress = `${postcode}, ${city}, ${country}`;
          setAddress(formattedAddress);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [location]);

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 2000,
      height: 1600,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const submitPost = async () => {
    if (!post) {
      Alert.alert('Error', 'Por favor, agrega un cuerpo al post.');
      return;
    }

    const imageUrl = await uploadImage();
    console.log('Image Url: ', imageUrl);
    console.log('Post: ', post);

    firestore()
      .collection('posts')
      .add({
        userId: user.uid,
        post: post,
        postImg: imageUrl,
        postTime: firestore.Timestamp.fromDate(new Date()),
        likes: null,
        comments: null,
        latitude: location.latitude, // Agregar la latitud al post
        longitude: location.longitude, // Agregar la longitud al post
        address: address, // Agregar la dirección al post
      })
      .then(() => {
        console.log('Post Added!');
        Alert.alert(
          'Post publicado',
          'Tu post ha sido publicado con éxito',
        );
        setPost(null);
      })
      .catch((error) => {
        console.log('Something went wrong with added post to firestore.', error);
      });
  };


  const uploadImage = async () => {
    if( image == null ) {
      return null;
    }

    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop(); 
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

       return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };
      

    

  return (
    <View style={styles.container}>
        <InputWrapper>
        {image != null ? <AddImage source={{uri: image}} /> : null}
        <InputField
        placeholder="Sube un post"
        multiline
        numberOfLine={4}
        value={post}
        onChangeText={(content) => setPost(content)}
        />
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completado</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <SubmitBtn onPress={submitPost}>
            <SubmitBtnText>Crear post</SubmitBtnText>
          </SubmitBtn>
        )}

        </InputWrapper>

       <ActionButton buttonColor="rgba(231,76,60,1)">
          <ActionButton.Item 
             buttonColor='#9b59b6' 
             title="Toma una foto" 
             onPress={takePhotoFromCamera}>
            <Icon name="camera-outline" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item 
             buttonColor='#3498db' 
             title="Elige una foto"
             onPress={choosePhotoFromLibrary}>
            <Icon name="md-image-outline" 
            style={styles.actionButtonIcon} />
          </ActionButton.Item>
          
        </ActionButton>

        
    </View>
  )
}

export default AddPostScreen;
const styles = StyleSheet.create({
    container: {
      backgroundColor: '##333333',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 34
      
    },
    text: {
      
      fontSize: 20,
      color: '#333333',
    },

    actionButtonIcon: {
      fontSize: 20,
      height: 22,
      color: 'white',
    },
  
  });
  
