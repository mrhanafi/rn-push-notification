import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  
  useEffect(() => {
    console.log('Registering for push notifications...')
    registerForPushNotificationsAsync().then(token => {
      console.log("tokeny:", token);
      setExpoPushToken(token)
    })
    .catch((err) => console.log(err));


  },[])

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  const sendNotification = async () => {
    console.log("Sending Push notification...")
    
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "My firsth push notification",
      body: "This is the first push notification thru expo"
    }
    await fetch("https://exp.host/--/api/v2/push/send",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body:JSON.stringify(message),
    })
  }
  return (
    
    <View style={{ marginTop: 100,alignItems:'center' }}>
      <Text style={{ marginVertical:30 }}>Expo Push Notifications</Text>
      <Button title='Send Push Notification' onPress={sendNotification}>Send Push Notification</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
