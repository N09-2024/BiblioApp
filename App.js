import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initDB } from './database';
import { Colors } from './theme';

import AccueilScreen    from './screens/AccueilScreen';
import FormulaireScreen from './screens/FormulaireScreen';
import DetailScreen     from './screens/DetailScreen';
import FavorisScreen    from './screens/FavorisScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbPret,   setDbPret]   = useState(false);
  const [erreurDB, setErreurDB] = useState(null);

  useEffect(() => {
    initDB()
      .then(() => setDbPret(true))
      .catch(e => setErreurDB(e.message));
  }, []);

  if (erreurDB) {
    return (
      <View style={styles.centré}>
        <Text style={styles.erreurTitre}>Erreur de base de données</Text>
        <Text style={styles.erreurMsg}>{erreurDB}</Text>
      </View>
    );
  }

  if (!dbPret) {
    return (
      <View style={styles.centré}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.chargementTexte}>Chargement…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Accueil"
        screenOptions={{
          headerStyle:      { backgroundColor: Colors.primary },
          headerTintColor:  '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          contentStyle:     { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Accueil"    component={AccueilScreen}    options={{ title: 'Ma Bibliothèque' }} />
        <Stack.Screen name="Formulaire" component={FormulaireScreen} options={({ route }) => ({ title: route.params?.livre ? 'Modifier le livre' : 'Ajouter un livre' })} />
        <Stack.Screen name="Detail"     component={DetailScreen}     options={{ title: 'Détails du livre' }} />
        <Stack.Screen name="Favoris"    component={FavorisScreen}    options={{ title: 'Mes Favoris' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centré:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  chargementTexte: { marginTop: 12, color: Colors.textSecondary, fontSize: 15 },
  erreurTitre:     { fontSize: 18, fontWeight: '700', color: Colors.danger, marginBottom: 8 },
  erreurMsg:       { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});