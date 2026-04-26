import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { ajouterLivre, modifierLivre } from '../database';

export default function FormulaireScreen({ route, navigation }) {
  const livreExistant = route.params?.livre;
  const [titre, setTitre] = useState(livreExistant?.titre || '');
  const [auteur, setAuteur] = useState(livreExistant?.auteur || '');
  const [genre, setGenre] = useState(livreExistant?.genre || '');
  const [nbPages, setNbPages] = useState(livreExistant?.nb_pages?.toString() || '');
  const [note, setNote] = useState(livreExistant?.note || 0);
  const [lu, setLu] = useState(livreExistant?.lu || 0);
  const [dateLecture, setDateLecture] = useState(livreExistant?.date_lecture || '');
  const [erreurs, setErreurs] = useState({});

  function valider() {
    let nouvErreurs = {};
    if (!titre.trim()) nouvErreurs.titre = 'Le titre est obligatoire';
    if (!auteur.trim()) nouvErreurs.auteur = "L'auteur est obligatoire";
    setErreurs(nouvErreurs);
    return Object.keys(nouvErreurs).length === 0;
  }

  async function enregistrer() {
    if (!valider()) return;
    const livre = {
      id: livreExistant?.id,
      titre: titre.trim(), auteur: auteur.trim(), genre: genre.trim(),
      nb_pages: parseInt(nbPages) || 0, note, lu, date_lecture: dateLecture.trim(),
    };
    if (livreExistant) { await modifierLivre(livre); Alert.alert('✅', 'Livre modifié !'); }
    else { await ajouterLivre(livre); Alert.alert('✅', 'Livre ajouté !'); }
    navigation.goBack();
  }

  function SelectionEtoiles() {
    return (
      <View style={styles.etoilesContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setNote(i)}>
            <Text style={[styles.etoile, i <= note && styles.etoileActive]}>{i <= note ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Titre *</Text>
      <TextInput style={[styles.input, erreurs.titre && styles.inputErreur]} value={titre} onChangeText={setTitre} placeholder="Titre du livre" />
      {erreurs.titre && <Text style={styles.erreur}>{erreurs.titre}</Text>}

      <Text style={styles.label}>Auteur *</Text>
      <TextInput style={[styles.input, erreurs.auteur && styles.inputErreur]} value={auteur} onChangeText={setAuteur} placeholder="Nom de l'auteur" />
      {erreurs.auteur && <Text style={styles.erreur}>{erreurs.auteur}</Text>}

      <Text style={styles.label}>Genre</Text>
      <TextInput style={styles.input} value={genre} onChangeText={setGenre} placeholder="Roman, SF, Policier..." />

      <Text style={styles.label}>Nombre de pages</Text>
      <TextInput style={styles.input} value={nbPages} onChangeText={setNbPages} placeholder="ex: 320" keyboardType="numeric" />

      <Text style={styles.label}>Date de lecture</Text>
      <TextInput style={styles.input} value={dateLecture} onChangeText={setDateLecture} placeholder="JJ/MM/AAAA" />

      <Text style={styles.label}>Note</Text>
      <SelectionEtoiles />

      <Text style={styles.label}>Statut</Text>
      <View style={styles.statutContainer}>
        <TouchableOpacity style={[styles.statutBtn, lu === 1 && styles.statutActif]} onPress={() => setLu(1)}>
          <Text style={lu === 1 ? styles.statutTexteActif : styles.statutTexte}>✅ Lu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statutBtn, lu === 0 && styles.statutActif]} onPress={() => setLu(0)}>
          <Text style={lu === 0 ? styles.statutTexteActif : styles.statutTexte}>📖 Non lu</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bouton} onPress={enregistrer}>
        <Text style={styles.boutonTexte}>{livreExistant ? '💾 Modifier' : '➕ Ajouter le livre'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 15 },
  inputErreur: { borderColor: '#e74c3c' },
  erreur: { color: '#e74c3c', fontSize: 12, marginTop: 3 },
  etoilesContainer: { flexDirection: 'row', marginVertical: 6 },
  etoile: { fontSize: 32, color: '#ccc', marginRight: 4 },
  etoileActive: { color: '#f4a41b' },
  statutContainer: { flexDirection: 'row', gap: 10, marginTop: 6 },
  statutBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', alignItems: 'center' },
  statutActif: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
  statutTexte: { color: '#333', fontWeight: '500' },
  statutTexteActif: { color: '#fff', fontWeight: 'bold' },
  bouton: { backgroundColor: '#4a90e2', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  boutonTexte: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});