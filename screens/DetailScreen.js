import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getLivreById, supprimerLivre, toggleFavori, mettreAJourPhoto } from '../database';
import { Colors, Radius, Shadow } from '../theme';

function Etoiles({ note, size = 20 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= note ? 'star' : 'star-outline'}
          size={size} color={i <= note ? Colors.gold : Colors.border} />
      ))}
    </View>
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

export default function DetailScreen({ route, navigation }) {
  const { livreId } = route.params;
  const [livre,   setLivre]   = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => { chargerLivre(); }, [livreId])
  );

  async function chargerLivre() {
    setLoading(true);
    try {
      const data = await getLivreById(livreId);
      if (!data) { Alert.alert('Erreur', 'Livre introuvable.'); navigation.goBack(); return; }
      setLivre(data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger le livre.');
    } finally {
      setLoading(false);
    }
  }

  async function basculerFavori() {
    try {
      await toggleFavori(livre.id, livre.favori);
      setLivre(prev => ({ ...prev, favori: prev.favori === 1 ? 0 : 1 }));
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris.');
    }
  }

  async function sauvegarderPhoto(uri) {
    try {
      await mettreAJourPhoto(livre.id, uri);
      setLivre(prev => ({ ...prev, photo: uri }));
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la photo.');
    }
  }

  async function prendrePhoto() {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) { Alert.alert('Permission refusée', 'Accès à la caméra nécessaire.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [2, 3], quality: 0.7 });
    if (!result.canceled) await sauvegarderPhoto(result.assets[0].uri);
  }

  async function choisirGalerie() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permission refusée', 'Accès à la galerie nécessaire.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [2, 3], quality: 0.7 });
    if (!result.canceled) await sauvegarderPhoto(result.assets[0].uri);
  }

  function confirmerSuppression() {
    Alert.alert('Supprimer', `Supprimer "${livre.titre}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await supprimerLivre(livre.id); navigation.navigate('Accueil');
      }},
    ]);
  }

  if (loading) return <View style={styles.centré}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!livre)  return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Photo ── */}
      <View style={styles.photoZone}>
        {livre.photo ? (
          <Image source={{ uri: livre.photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="book-outline" size={56} color={Colors.primary} />
            <Text style={styles.photoHint}>Pas de couverture</Text>
          </View>
        )}
        <View style={styles.photoBtns}>
          <TouchableOpacity style={styles.photoBtn} onPress={prendrePhoto}>
            <Ionicons name="camera-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.photoBtnTxt}>Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={choisirGalerie}>
            <Ionicons name="images-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.photoBtnTxt}>Galerie</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Infos ── */}
      <View style={styles.card}>
        <Text style={styles.titre}>{livre.titre}</Text>
        <Text style={styles.auteur}>par {livre.auteur}</Text>

        <View style={styles.rangee}>
          <Etoiles note={livre.note} size={22} />
          <View style={[styles.badge, livre.lu ? styles.badgeLu : styles.badgeNonLu]}>
            <Ionicons
              name={livre.lu ? 'checkmark-circle-outline' : 'book-outline'}
              size={13} color={livre.lu ? Colors.success : Colors.danger}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeTxt, livre.lu ? styles.badgeTxtLu : styles.badgeTxtNonLu]}>
              {livre.lu ? 'Lu' : 'Non lu'}
            </Text>
          </View>
        </View>

        {livre.genre        ? <Ligne label="Genre"           valeur={livre.genre} /> : null}
        {livre.nb_pages > 0 ? <Ligne label="Nombre de pages" valeur={`${livre.nb_pages} pages`} /> : null}
        {livre.date_lecture ? <Ligne label="Date de lecture"  valeur={livre.date_lecture} /> : null}
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, livre.favori === 1 ? styles.btnFavoriActif : styles.btnFavori]}
          onPress={basculerFavori}
        >
          <Ionicons name={livre.favori === 1 ? 'star' : 'star-outline'} size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnTxt}>{livre.favori === 1 ? 'Retirer des favoris' : 'Ajouter aux favoris'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnModifier]}
          onPress={() => navigation.navigate('Formulaire', { livre })}>
          <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnTxt}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnSupprimer]} onPress={confirmerSuppression}>
          <Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnTxt}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  centré:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  photoZone:          { backgroundColor: Colors.surface, alignItems: 'center', padding: 20, marginBottom: 12, ...Shadow.sm },
  photo:              { width: 130, height: 195, borderRadius: Radius.md, marginBottom: 12 },
  photoPlaceholder:   { width: 130, height: 195, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  photoHint:          { color: Colors.textLight, fontSize: 12, marginTop: 6 },
  photoBtns:          { flexDirection: 'row', gap: 10 },
  photoBtn:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.background, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  photoBtnTxt:        { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  card:               { backgroundColor: Colors.surface, marginHorizontal: 12, borderRadius: Radius.lg, padding: 18, marginBottom: 12, ...Shadow.md },
  titre:              { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  auteur:             { fontSize: 15, color: Colors.textSecondary, marginBottom: 14 },
  rangee:             { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  badge:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  badgeLu:            { backgroundColor: Colors.successLight },
  badgeNonLu:         { backgroundColor: Colors.dangerLight },
  badgeTxt:           { fontSize: 13, fontWeight: '600' },
  badgeTxtLu:         { color: Colors.success },
  badgeTxtNonLu:      { color: Colors.danger },
  ligne:              { flexDirection: 'row', marginBottom: 8 },
  ligneLabel:         { width: 140, fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  ligneValeur:        { flex: 1, fontSize: 14, color: Colors.textPrimary },
  actions:            { paddingHorizontal: 12, paddingBottom: 32, gap: 10 },
  btn:                { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: Radius.lg, ...Shadow.sm },
  btnTxt:             { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnFavori:          { backgroundColor: Colors.gold },
  btnFavoriActif:     { backgroundColor: Colors.warning },
  btnModifier:        { backgroundColor: Colors.primary },
  btnSupprimer:       { backgroundColor: Colors.danger },
});