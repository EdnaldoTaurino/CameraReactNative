import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Modal, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { FileSystem } from 'expo-file-system';
import { useEffect, useState, useRef } from 'react';
import Icon from "react-native-vector-icons/FontAwesome";
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
const canRef = useRef(null);
const [flypCamera, setFlypCamera] = useState(Camera.Constants.Type.back);
const [hasPermission, setHasPermission] = useState(null);
const [capturedPhoto, setCapturedPhoto] = useState(null);
const [openModalImage, setOpenModalImage] = useState(false);


useEffect(() => {
  (async () => {
    const {status} = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  })();
}, []);

// permission camera user 👇
  if (hasPermission === null) {
    return <View/>
  }

  if (hasPermission === false){
    return <Text>Camera Acesso negado!</Text>;
  }

  async function takePicture (){
    if (canRef) {
      const data = await canRef.current.takePictureAsync();
      setCapturedPhoto(data.uri);
      setOpenModalImage(true);
      console.log(data);
    }
  }


  async function savePicture() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
  
    if (status === 'granted' && capturedPhoto) {
      try {
        const asset = await MediaLibrary.createAssetAsync(capturedPhoto);
        const album = await MediaLibrary.getAlbumAsync('Camera');
  
        if (album === null) {
          await MediaLibrary.createAlbumAsync('Camera', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
  
        console.log('Foto salva com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar a foto:', error);
      }
    } else {
      console.log('Permissão de acesso à biblioteca de mídia negada.');
    }
  }

  return (
    <View style={styles.container}>
      <Camera
        style={{flex:1}}
        type={flypCamera}
        ref={canRef}
        flashMode={Camera.Constants.FlashMode.on}
      >
      <View style={{flex:1, backgroundColor: 'transparent', flexDirection:'row' }}>
        <TouchableOpacity style={{position:'absolute', bottom:20, left:20}} onPress={() => {
          setFlypCamera(flypCamera === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
          }}>
          <Text style={{backgroundColor:'white', fontSize:20, borderRadius:10}}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
      </Camera>

      <TouchableOpacity style={styles.takePicture} onPress={takePicture}>
        <Icon name = 'camera' size={28} color={'white'}
        />
      </TouchableOpacity>

      {capturedPhoto && 
      <Modal
        animationType='slide'
        transparent={false}
        visible={openModalImage}
      >
        <View style={{flex:1, justifyContent:'center', alignItems:'center', margin: 20}}>

          <View style={{margin:10, flexDirection:'row'}}>
            <TouchableOpacity onPress={() => setOpenModalImage (false)}>
              <Icon name='window-close' size={35} color='red'/>
            </TouchableOpacity>
            <TouchableOpacity onPress={ savePicture }>
              <Icon name='upload' size={35} color='blue'/>
            </TouchableOpacity>
          </View>

          <Image
            style={{width: '100%', height: 500, borderRadius: 20}}
            source={{uri: capturedPhoto}}
          />
        </View>
      </Modal>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }, 

  takePicture:{
    // position:"absolute",
    // alignItems: "center",
    // right:35,
    // top:40,
    // width:60,
    // height:60,
    // backgroundColor:"#FFF",
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor:'#121212',
    margin: 20,
    borderRadius: 20,
    height:50,
  },
});
