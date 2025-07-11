import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/components/SplashScreen';
import AuthScreen from './src/components/AuthScreen';
import OtpScreen from './src/components/OtpScreen';
import Login from './src/components/Login';
import PhoneNum from './src/components/PhoneNum';
import UserTypeSelection from './src/components/UserTypeSelection';
import SignUp from './src/components/SignUp';
import CreatePassword from './src/components/CreatePassword';
import UserHome from './src/components/UserHome';
import { UserTypeProvider } from './src/context/UserTypeContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Messages from './src/components/Messages'; // Placeholder, create if not exists
import Profile from './src/components/Profile'; // Placeholder, create if not exists
import SOS from './src/components/SOS'; // Placeholder, create if not exists
import Breakdown from './src/components/Breakdown'; // Placeholder, create if not exists
import { Image } from 'react-native';
import homeIcon from './src/images/home.png';
import chatIcon from './src/images/chat.png';
import userIcon from './src/images/user.png';
import sosIcon from './src/images/sos.png';
import carIcon from './src/images/car.png';
import CustomTabBar from './src/components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={UserHome} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="SOS" component={SOS} />
      <Tab.Screen name="Breakdown" component={Breakdown} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserTypeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelection} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="PhoneNum" component={PhoneNum} />
          <Stack.Screen name="CreatePassword" component={CreatePassword} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserTypeProvider>
  );
}
