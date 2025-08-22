import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/components/SplashScreen';
import OtpScreen from './src/components/OtpScreen';
import Login from './src/components/Login';
import PhoneNum from './src/components/PhoneNum';
import UserTypeSelection from './src/components/UserTypeSelection';
import SignUp from './src/components/SignUp';
import CreatePassword from './src/components/CreatePassword';
import UserHome from './src/components/UserHome';
import { UserTypeProvider, UserTypeContext } from './src/context/UserTypeContext';
import { RatingProvider } from './src/context/RatingContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Messages from './src/components/Messages';
import Profile from './src/components/Profile';
import SOS from './src/components/SOS';
import Breakdown from './src/components/Breakdown';
import { Image, View, Text, ActivityIndicator } from 'react-native';
import MechHome from "./src/components/MechHome"
import homeIcon from './src/images/home.png';
import chatIcon from './src/images/chat.png';
import userIcon from './src/images/user.png';
import sosIcon from './src/images/sos.png';
import carIcon from './src/images/car.png';
import CustomTabBar from './src/components/CustomTabBar';
import MechTabBar from './src/components/MechTabBar';
import { useContext } from 'react';
import HomeScreenSelector from './src/components/HomeScreenSelector';
import FullMapScreen from './src/components/FullMapScreen';
import MechProfile from './src/components/MechProfile';
import Requests from './src/components/Requests';
import Availability from './src/components/Availability';
import Services from './src/components/Services';
import FoundMechanic from './src/components/FoundMechanic';
import ForgotPasswordOtpScreen from './src/components/ForgotPasswordOtpScreen';
import ForgotPasswordScreen from './src/components/ForgotPasswordscreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import LogoutScreen from './src/components/LogoutScreen';
import UserDetail from './src/components/UserDetail';
import WorkerPage from './src/components/WorkerPage';
import AssignedMech from './src/components/AssignedMech';
import TrackingMap from './src/components/TrackingMap';

import CustomerHistory from './src/components/CustomerHistory';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading...</Text>
  </View>
);

function MainTabNavigator() {
  const { userType, isLoading, initializationCount } = useContext(UserTypeContext);

  console.log(' [MainTabNavigator] Render - userType:', userType, 'isLoading:', isLoading, 'initCount:', initializationCount);

  // Show loading screen while context is initializing
  if (isLoading) {
    console.log('⏳ [MainTabNavigator] Showing loading screen');
    return <LoadingScreen />;
  }

  // If no userType after loading, show loading screen (the logout hook will handle navigation)
  if (!userType) {
    console.log('⚠️ [MainTabNavigator] No userType, showing loading screen');
    return <LoadingScreen />;
  }

  if (userType === 'user') {
    console.log('✅ [MainTabNavigator] Rendering USER tabs');
    return (
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeScreenSelector} />
        <Tab.Screen name="Messages" component={Messages} />
        <Tab.Screen name="SOS" component={SOS} />
        <Tab.Screen name="Breakdown" component={Breakdown} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    );
  }
  
  if (userType === 'mechanic') {
    console.log('✅ [MainTabNavigator] Rendering MECHANIC tabs');
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <MechTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={MechHome} />
      <Tab.Screen name="Availability" component={Availability} />
      <Tab.Screen name="Services" component={Services} />
      <Tab.Screen name="Requests" component={Requests} />
      <Tab.Screen name="Profile" component={MechProfile} />
    </Tab.Navigator>
  );
}

  console.log('❌ [MainTabNavigator] Unknown userType:', userType);
  return <LoadingScreen />;
}

export default function App() {
  console.log('🚀 [App] Rendering main App component');
  
  return (
    <ErrorBoundary>
    <UserTypeProvider>
      <RatingProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="UserTypeSelection" component={UserTypeSelection} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
              <Stack.Screen name="Logout" component={LogoutScreen} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="PhoneNum" component={PhoneNum} />
            <Stack.Screen name="CreatePassword" component={CreatePassword} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
            <Stack.Screen name="FullMap" component={FullMapScreen} />
            <Stack.Screen name="FoundMechanic" component={FoundMechanic} />
              <Stack.Screen name="UserDetail" component={UserDetail} /> 
              <Stack.Screen name="WorkerPage" component={WorkerPage} /> 
              <Stack.Screen name="AssignedMech" component={AssignedMech} />
              <Stack.Screen name="TrackingMap" component={TrackingMap} />
              <Stack.Screen name="CustomerHistory" component={CustomerHistory} />
            </Stack.Navigator>
          </NavigationContainer>
        </RatingProvider>
      </UserTypeProvider>
    </ErrorBoundary>
  );
}
