import React from 'react';
import { useUserType } from '../context/UserTypeContext';
import UserHome from './UserHome';
import MechHome from './MechHome';

export default function HomeScreenSelector(props) {
  const { userType } = useUserType();
  if (userType === 'mechanic') return <MechHome {...props} />;
  return <UserHome {...props} />;
}
