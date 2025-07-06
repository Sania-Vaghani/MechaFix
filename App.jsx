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
import { UserTypeProvider } from './src/context/UserTypeContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserTypeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelection} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="PhoneNum" component={PhoneNum} />
          <Stack.Screen name="CreatePassword" component={CreatePassword} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserTypeProvider>
  );
}
