import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supprimerLivre, toggleFavori, mettreAJourPhoto } from '../database';

export default function DetailScreen({ route, navigation }) {
  const [livre, setLivre] = useState(route.params.livre);
  // Initialise la photo depuis la DB (livre.photo) au lieu de null
  const [photo, setPhoto] = useState(livre.photo || null);

  function etoiles(note) { return '★'.repeat(note) + '☆'.repeat(5 - note); }

  function confirmerSuppression() {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce livre ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => { await supprimerLivre(livre.id); navigation.navigate('Accueil'); }
      },
    ]);
  }

  async function basculerFavori() {
    await toggleFavori(livre.id, livre.favori);
    setLivre({ ...livre, favori: livre.favori === 1 ? 0 : 1 });
  }

  // Sauvegarde la photo en DB et met à jour l'état local
  async function sauvegarderPhoto(uri) {
    setPhoto(uri);
    setLivre({ ...livre, photo: uri });
    await mettreAJourPhoto(livre.id, uri);
  }

  async function prendrePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [2, 3], quality: 0.7 });
    if (!result.canceled) await sauvegarderPhoto(result.assets[0].uri);
  }

  async function choisirDepuisGalerie() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [2, 3], quality: 0.7 });
    if (!result.canceled) await sauvegarderPhoto(result.assets[0].uri);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.couvertureZone}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.couverture} />
        ) : (
          <View style={styles.couverturePlaceholder}>
            <Text style={styles.couverturePlaceholderTexte}>📚</Text>
            <Text style={{ color: '#999', fontSize: 12 }}>Pas de couverture</Text>
          </View>
        )}
        <View style={styles.boutonsPhoto}>
          <TouchableOpacity style={styles.boutonPhoto} onPress={prendrePhoto}>
            <Text style={styles.boutonPhotoTexte}>📷 Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonPhoto} onPress={choisirDepuisGalerie}>
            <Text style={styles.boutonPhotoTexte}>🖼️ Galerie</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infos}>
        <Text style={styles.titre}>{livre.titre}</Text>
        <Text style={styles.auteur}>par {livre.auteur}</Text>
        <View style={styles.rangee}>
          <Text style={styles.etoiles}>{etoiles(livre.note)}</Text>
          <Text style={[styles.badge, livre.lu ? styles.lu : styles.nonLu]}>
            {livre.lu ? '✅ Lu' : '📖 Non lu'}
          </Text>
        </View>
        {livre.genre     ? <Ligne label="Genre"          valeur={livre.genre} /> : null}
        {livre.nb_pages  ? <Ligne label="Pages"          valeur={livre.nb_pages} /> : null}
        {livre.date_lecture ? <Ligne label="Date de lecture" valeur={livre.date_lecture} /> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.bouton, livre.favori === 1 ? styles.boutonFavoriActif : styles.boutonFavori]}
          onPress={basculerFavori}
        >
          <Text style={styles.boutonTexte}>
            {livre.favori === 1 ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bouton, styles.boutonModifier]}
          onPress={() => navigation.navigate('Formulaire', { livre })}
        >
          <Text style={styles.boutonTexte}>✏️ Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bouton, styles.boutonSupprimer]} onPress={confirmerSuppression}>
          <Text style={styles.boutonTexte}>🗑️ Supprimer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Ligne({ label, valeur }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneLabel}>{label} :</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  couvertureZone: { alignItems: 'center', padding: 16, backgroundColor: '#fff', marginBottom: 12 },
  couverture: { width: 120, height: 180, borderRadius: 8, marginBottom: 10 },
  couverturePlaceholder: { width: 120, height: 180, borderRadius: 8, backgroundColor: '#e9ecef', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  couverturePlaceholderTexte: { fontSize: 48 },
  boutonsPhoto: { flexDirection: 'row', gap: 10 },
  boutonPhoto: { backgroundColor: '#f0f0f0', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  boutonPhotoTexte: { fontSize: 13, color: '#333' },
  infos: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  auteur: { fontSize: 16, color: '#7f8c8d', marginBottom: 10 },
  rangee: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  etoiles: { fontSize: 20, color: '#f4a41b' },
  badge: { fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  lu: { backgroundColor: '#d4edda', color: '#155724' },
  nonLu: { backgroundColor: '#f8d7da', color: '#721c24' },
  ligne: { flexDirection: 'row', marginBottom: 6 },
  ligneLabel: { fontSize: 14, color: '#666', width: 120, fontWeight: '500' },
  ligneValeur: { fontSize: 14, color: '#333', flex: 1 },
  actions: { padding: 16, gap: 10 },
  bouton: { padding: 13, borderRadius: 10, alignItems: 'center' },
  boutonTexte: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  boutonFavori: { backgroundColor: '#f39c12' },
  boutonFavoriActif: { backgroundColor: '#e67e22' },
  boutonModifier: { backgroundColor: '#4a90e2' },
  boutonSupprimer: { backgroundColor: '#e74c3c' },
});