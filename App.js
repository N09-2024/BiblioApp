import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccueilScreen from './screens/AccueilScreen';
import FormulaireScreen from './screens/FormulaireScreen';
import DetailScreen from './screens/DetailScreen';
import FavorisScreen from './screens/FavorisScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil">
        <Stack.Screen name="Accueil" component={AccueilScreen} options={{ title: '📚 Ma Bibliothèque' }} />
        <Stack.Screen name="Formulaire" component={FormulaireScreen} options={{ title: 'Ajouter / Modifier' }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Détails du livre' }} />
        <Stack.Screen name="Favoris" component={FavorisScreen} options={{ title: '⭐ Mes Favoris' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}