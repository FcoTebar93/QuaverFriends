import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          _id: user.uid,
          name: user.displayName,
          avatar: user.photoURL ? user.photoURL : '../assets/chat-images/3447513.png',
        });
      } else {
        setCurrentUser(null);
      }
    });

    const messagesRef = firebase.firestore().collection('messages').orderBy('createdAt', 'desc');
    const unsubscribeMessages = messagesRef.onSnapshot((querySnapshot) => {
      
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === 'added')
        .map(({ doc }) => {
          const message = doc.data();
          return {
            _id: doc.id,
            text: message.text,
            createdAt: message.createdAt.toDate(),
            user: {
              _id: message.user._id,
              name: message.user.name,
              avatar: message.user.avatar,
            },
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
      appendMessages(messagesFirestore);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    },
    []
  );

  const onSend = useCallback((messages = []) => {
    const newMessage = messages[0];
  
    // Obtener el valor de userImg del usuario actualmente conectado
    const userImg = firebase.firestore().collection('users').doc(currentUser._id).get().then((doc) => {
      if (doc.exists) {
        return doc.data().userImg;
      } else {
        return null;
      }
    }).catch((error) => {
      console.log("Error al obtener la imagen del usuario:", error);
      return null;
    });
  
    // Agregar el mensaje a la colección de Firebase con el valor de userImg
    firebase.firestore().collection('messages').add({
      text: newMessage.text,
      createdAt: new Date(),
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        userImg: userImg, // Asignar el valor de userImg al campo userImg del mensaje
      },
    });
  }, [currentUser]);

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons name="send-circle" style={{ marginBottom: 5, marginRight: 5 }} size={32} color="#fc735b" />
        </View>
      </Send>
    );
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#333333',
          },
          left: {
            backgroundColor: '#f0f0f0',
          },
        }}
        textStyle={{
          right: {
            color: '#ffffff',
          },
          left: {
            color: '#333333',
          },
        }}
      >
        {/* Eliminar la imagen del usuario */}
        {props.currentMessage.user._id !== currentUser._id && (
          <View style={styles.userImage} />
        )}
      </Bubble>
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />;
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser ? currentUser._id : null,
        }}
        renderBubble={renderBubble}
        alwaysShowSend
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 60,
  },
});