import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { OtherScreen } from '../screens/OtherScreen';
import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';
import AuthStack from './AuthNavigator';

const AppStack = createStackNavigator({ Home: HomeScreen, Other: OtherScreen });

const AppContainer =  createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));

export default AppContainer;