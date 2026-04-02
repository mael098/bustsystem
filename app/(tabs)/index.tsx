import { Button, StyleSheet, Text, View } from 'react-native';


export default function HomeScreen() {
  return (
  <View style={styles.conteiner}>
      <Text>Hola mundo 👋</Text>
      <Button title="Pícale" onPress={() => alert('Hola bro')} />
    </View>
  
  );
}

const styles = StyleSheet.create({
  conteiner: {
    flex:1,
    backgroundColor:'white',
    padding:40,
    width:"auto",
    height: "auto",
  }

});
