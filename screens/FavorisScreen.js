import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getFavoris, toggleFavori } from '../database';
import { Colors, Radius, Shadow } from '../theme';

function Etoiles({ note, size = 12 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= note ? 'star' : 'star-outline'}
          size={size} color={i <= note ? Colors.gold : Colors.border} />
      ))}
    </View>
  );
}

export default function FavorisScreen({ navigation }) {
  const [favoris,   setFavoris]   = useState([]);
  const [recherche, setRecherche] = useState('');
  const [loading,   setLoading]   = useState(false);

  useFocusEffect(
    useCallback(() => { chargerFavoris(); }, [recherche])
  );

  async function chargerFavoris() {
    setLoading(true);
    try {
      const data = await getFavoris(recherche);
      setFavoris(data);
    } catch (e) {
      console.error('chargerFavoris:', e);
    } finally {
      setLoading(false);
    }
  }

  async function retirerFavori(id) {
    try {
      await toggleFavori(id, 1);
      await chargerFavoris();
    } catch (e) {
      console.error('retirerFavori:', e);
    }
  }

  return (
    <View style={styles.container}>

      {/* ── Recherche ── */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.textLight} style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans les favoris…"
          placeholderTextColor={Colors.textLight}
          value={recherche}
          onChangeText={setRecherche}
        />
        {recherche.length > 0 && (
          <TouchableOpacity onPress={() => setRecherche('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Compteur ── */}
      {favoris.length > 0 && (
        <Text style={styles.compteur}>{favoris.length} favori{favoris.length > 1 ? 's' : ''}</Text>
      )}

      {/* ── Contenu ── */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : favoris.length === 0 ? (
        <View style={styles.vide}>
          <Ionicons name="star-outline" size={64} color={Colors.border} />
          <Text style={styles.videTitre}>
            {recherche ? 'Aucun favori trouvé' : 'Aucun favori pour l\'instant'}
          </Text>
          <Text style={styles.videIndication}>
            {recherche
              ? 'Essayez un autre terme de recherche.'
              : 'Ouvrez la fiche d\'un livre pour l\'ajouter aux favoris.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoris}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.carte}>
              <TouchableOpacity
                style={styles.carteInfo}
                onPress={() => navigation.navigate('Detail', { livreId: item.id })}
              >
                <Text style={styles.carteTitre} numberOfLines={1}>{item.titre}</Text>
                <Text style={styles.carteAuteur} numberOfLines={1}>{item.auteur}</Text>
                <Etoiles note={item.note} />

                <View style={styles.badgesRow}>
                  <View style={[styles.badge, item.lu ? styles.badgeLu : styles.badgeNonLu]}>
                    <Ionicons
                      name={item.lu ? 'checkmark-circle-outline' : 'book-outline'}
                      size={11} color={item.lu ? Colors.success : Colors.danger}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={[styles.badgeTxt, item.lu ? styles.badgeTxtLu : styles.badgeTxtNonLu]}>
                      {item.lu ? 'Lu' : 'Non lu'}
                    </Text>
                  </View>
                  {item.genre ? (
                    <View style={styles.badgeGenre}>
                      <Text style={styles.badgeGenreTxt}>{item.genre}</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnRetirer} onPress={() => retirerFavori(item.id)}>
                <Ionicons name="star" size={22} color={Colors.gold} />
                <Text style={styles.btnRetirerLabel}>Retirer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background, padding: 12 },
  searchBox:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, ...Shadow.sm },
  searchInput:    { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  compteur:       { fontSize: 12, color: Colors.textLight, marginBottom: 6, paddingHorizontal: 4 },
  carte:          { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14, marginBottom: 10, alignItems: 'center', ...Shadow.md },
  carteInfo:      { flex: 1, gap: 4 },
  carteTitre:     { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  carteAuteur:    { fontSize: 13, color: Colors.textSecondary },
  badgesRow:      { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  badge:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeLu:        { backgroundColor: Colors.successLight },
  badgeNonLu:     { backgroundColor: Colors.dangerLight },
  badgeTxt:       { fontSize: 11, fontWeight: '600' },
  badgeTxtLu:     { color: Colors.success },
  badgeTxtNonLu:  { color: Colors.danger },
  badgeGenre:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  badgeGenreTxt:  { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  btnRetirer:     { alignItems: 'center', paddingLeft: 12 },
  btnRetirerLabel:{ fontSize: 10, color: Colors.textLight, marginTop: 3 },
  vide:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  videTitre:      { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  videIndication: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 30 },
});