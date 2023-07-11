import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import FormButton from '../components/formButton';
import FormInput from '../components/formInput';
import SocialButton from '../components/SocialButton';
import { AuthContext } from '../navigation/AuthProvider';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, setUser } = useContext(AuthContext);

  const handleLogin = () => {
    if (email && password) {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then((response) => {
          const uid = response.user.uid;
          const userData = {
            uid,
            email: response.user.email,
          };
          setUser(userData);
        })
        .catch((error) => {
          if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
            Alert.alert('Error', 'El correo electrónico o la contraseña son incorrectos.');
          } else {
            Alert.alert('Error', 'Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.');
          }
        });
    } else {
      Alert.alert('Error', 'Por favor, introduce un correo electrónico y contraseña válidos.');
    }
  };
  
    return (
      <View style={styles.container}>
        <Image
        resizeMode='contain'
        source={require('../assets/360_F_111099954_dYajekJo08vAPdqxfw9E9fEXXwJCW0Q0.jpg')}
        style={styles.logo}
      />
      <Text style={styles.text}>Quaver Friends</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />

      <FormButton
        buttonTitle="Iniciar sesion"
        onPress={handleLogin}
      />

      <TouchableOpacity
        
        onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.navButtonText}>
          No tienes una cuenta? Creala
        </Text>
      </TouchableOpacity>

      </View>
      
    )
  }
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode:"cover",
    marginBottom: 50,
    backgroundColor:"#000000",
  },
  text: {
    fontFamily: 'Kufam-SemiBoldItalic',
    fontSize: 28,
    marginBottom: 10,
    color: '#333333',
  },
  navButton: {
    marginTop: 15,
    backgroundColor: '#fc735b'
  },
  forgotButton: {
    marginVertical: 15,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    fontFamily: 'Lato-Regular',
  },
});
