import React from 'react'
import { Text, View, StyleSheet, Image,TouchableOpacity, Button } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper';

const Skip = ({...props}) => (
  <TouchableOpacity
      style={{marginHorizontal:10}}
      {...props}
  >
      <Text style={{fontSize:16}}>Saltar</Text>
  </TouchableOpacity>
);

const Next = ({...props}) => (
  <TouchableOpacity
      style={{marginHorizontal:10}}
      {...props}
  >
      <Text style={{fontSize:16}}>Siguiente</Text>
  </TouchableOpacity>
);

const Done = ({...props}) => (
  <TouchableOpacity
      style={{marginHorizontal:10}}
      {...props}
  >
      <Text style={{fontSize:16}}>Entendido</Text>
  </TouchableOpacity>
);

const Dots = ({selected}) => {
  let backgroundColor;

  backgroundColor = selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)';

  return (
      <View 
          style={{
              width:6,
              height: 6,
              marginHorizontal: 3,
              backgroundColor
          }}
      />
  );
}

const OnBoardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      SkipButtonComponent={Skip}
      NextButtonComponent={Next}
      DoneButtonComponent={Done}
      DotComponent={Dots}
      onSkip={() => navigation.replace("Login")}
      onDone={() => navigation.navigate("Login")}
      pages={[
        {
          backgroundColor: 'white',
          image: (
            <Image
              source={require('../assets/dfbb031206af08bc4972e10180757a17.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
          ),
          title: 'Conecta con tus bandas favoritas',
          subtitle: 'Una forma de conocer nueva música o conectar con tu favorita',
        },
        {
          backgroundColor: 'white',
          image: (
            <Image
              source={require('../assets/6e16ccd913d40230d547fd7163288f36.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
          ),
          title: 'Postea sobre tus lugares favoritos de música en vivo',
          subtitle: 'Ponte en contacto con gente que disfrute de esos lugares o gente nueva',
        },
        {
          backgroundColor: 'white',
          image: (
            <Image
              source={require('../assets/0ad4fdfc9dbd51e850489ec650d1874d.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
          ),
          title: 'Conoce a gente con gustos musicales en común',
          subtitle: 'El Chat en vivo es una forma perfecta para conocer a gente con tus mismos gustos',
        },
      ]}
    />
  );
};


export default OnBoardingScreen;

const styles = StyleSheet.create({
    cointainer:{
        flex:1,
    },
})
