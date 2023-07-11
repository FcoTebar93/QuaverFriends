import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from '../styles/MessageStyles';

const Messages = [
  {
    id: '1',
    userName: 'Metal',
    userImg: require('../assets/chat-images/970995-200.png'),
    messageText:
      'Chat sobre Heavy Metal',
  },
  {
    id: '2',
    userName: 'Hip hop',
    userImg: require('../assets/chat-images/png-clipart-rapper-computer-icons-hip-hop-music-rap-miscellaneous-face-thumbnail.png'),
    messageText:
      'Chat sobre Hip Hop',
  },
  {
    id: '3',
    userName: 'Pop',
    userImg: require('../assets/chat-images/pop.png'),
    messageText:
      'Chat sobre pop',
  },
  {
    id: '4',
    userName: 'Rock',
    userImg: require('../assets/chat-images/2199155-200.png'),
    messageText:
      'Chat sobre Rock',
  },
];

const MessagesScreen = ({navigation}) => {
    return (
      <Container>
        <FlatList 
          data={Messages}
          keyExtractor={item=>item.id}
          renderItem={({item}) => (
            <Card onPress={() => navigation.navigate('Chat', {userName: item.userName})}>
              <UserInfo>
                <UserImgWrapper>
                  <UserImg source={item.userImg} />
                </UserImgWrapper>
                <TextSection>
                  <UserInfoText>
                    <UserName>{item.userName}</UserName>
                    <PostTime>{item.messageTime}</PostTime>
                  </UserInfoText>
                  <MessageText>{item.messageText}</MessageText>
                </TextSection>
              </UserInfo>
            </Card>
          )}
        />
      </Container>
    );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});
  
