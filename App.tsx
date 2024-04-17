import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Dimensions} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission, useMicrophonePermission} from 'react-native-vision-camera'

import {Video, ResizeMode} from 'expo-av'
import * as MediaLibrary from 'expo-media-library'

const {width: widthScreen, height: heightScreen} = Dimensions.get("screen")

export default function App() {
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const {hasPermission: hasMicPermission, requestPermission: resquestMicPermission} = useMicrophonePermission();
  const [permission, setPermission] = useState<null | Boolean>(null)
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(String);
  const [modalVisible, setModalVisible] = useState(false);

  const cameraRef = useRef<Camera>(null)

  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      const statusMic = await resquestMicPermission();

      if(status && statusMic){
        setPermission(true);
      }

      const {status: statusMediaLibrary} = await MediaLibrary.requestPermissionsAsync();
      if(statusMediaLibrary !== "granted"){
        console.log("Media Library nao autorizada!")
        setPermission(false);
        return;
      }

    })()
  }, [])


  const startRecording = () => { 
    if(!cameraRef.current || !device) return;
    setIsRecording(true); 

    cameraRef.current.startRecording({
      onRecordingFinished: (video) => {
        setIsRecording(false);
       setVideoUri(video.path)
       setModalVisible(true);
      },
      onRecordingError:(error) => {
        console.log("Deu erro: ");
        console.log(error);
      },
    })

  }

  const stopRecording = async () => {
    if(cameraRef.current) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  }


  function handleCloseModal() {
    setModalVisible(false)
  }

  const handleSaveVideo = async () => {
  if(videoUri){
    try{
      await MediaLibrary.createAssetAsync(videoUri)
      console.log("SALVO COM SUCESSO")
    }catch(error){
      console.log("Erro ao salvar")
      console.log(error);
    }
  }  


  }


  if(!permission) return <View></View>

  if(!device || device == null) return <View></View>

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <Camera 
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        orientation='portrait'
        resizeMode='cover'
      />

      <TouchableOpacity 
      onPressIn={startRecording}
      onPressOut={stopRecording}
        style={{
          width: 70,
          height: 70,
          borderRadius: 99,
          borderWidth: 8,
          borderColor: 'red',
          position: 'absolute',
          bottom: 70,
          alignSelf: 'center'
        }}
      />

        <Modal 
          animationType='slide'
          transparent={false}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.videoContainer}>
              
              <Video 
                source={{ uri: videoUri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                shouldPlay
                isLooping
                resizeMode={ResizeMode.COVER}
                style= {{width: widthScreen, height: heightScreen}}
              />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text onPress={handleCloseModal}
              >Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text onPress={handleSaveVideo} >salvar Video</Text>
            </TouchableOpacity>
          </View>

        </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  videoContainer: {
    flex:1,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    display: 'flex',
    zIndex: 99,
    flexDirection: 'row',
    gap: 14,
   
    justifyContent: 'center'
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFF',
    color: '#000',
    width: 140,
    height: 45,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 4,
  }
});
