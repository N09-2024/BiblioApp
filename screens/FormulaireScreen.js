import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Modal, BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ajouterLivre, modifierLivre } from '../database';
import { Colors, Radius, Shadow } from '../theme';

const GENRES = [
  'Roman', 'Science-Fiction', 'Policier / Thriller', 'Fantaisie', 'Horreur',
  'Biographie', 'Histoire', 'Science', 'Développement personnel',
  'Philosophie', 'Jeunesse', 'Manga / BD', 'Autre',
];

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

function Champ({ label, erreur, children }) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {erreur ? (
        <View style={styles.erreurRow}>
          <Ionicons name="warning-outline" size={13} color={Colors.danger} style={{ marginRight: 4 }} />
          <Text style={styles.erreurTxt}>{erreur}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function FormulaireScreen({ route, navigation }) {
  const livreExistant = route.params?.livre;

  const [titre,      setTitre]      = useState(livreExistant?.titre        || '');
  const [auteur,     setAuteur]     = useState(livreExistant?.auteur       || '');
  const [genre,      setGenre]      = useState(livreExistant?.genre        || '');
  const [genrePerso, setGenrePerso] = useState('');
  const [nbPages,    setNbPages]    = useState(livreExistant?.nb_pages > 0 ? String(livreExistant.nb_pages) : '');
  const [note,       setNote]       = useState(livreExistant?.note         || 0);
  const [lu,         setLu]         = useState(livreExistant?.lu           ?? 0);
  const [dateLec,    setDateLec]    = useState(livreExistant?.date_lecture || '');
  const [erreurs,    setErreurs]    = useState({});
  const [showGenres, setShowGenres] = useState(false);
  const [modifié,    setModifié]    = useState(false);

  useEffect(() => { setModifié(true); }, [titre, auteur, genre, nbPages, note, lu, dateLec]);

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        if (modifié && (titre.trim() || auteur.trim())) {
          Alert.alert(
            'Quitter sans sauvegarder ?',
            'Vos modifications seront perdues.',
            [
              { text: 'Rester',  style: 'cancel' },
              { text: 'Quitter', style: 'destructive', onPress: () => navigation.goBack() },
            ]
          );
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [modifié, titre, auteur])
  );

  function valider() {
    const errs = {};
    if (!titre.trim())  errs.titre  = 'Le titre est obligatoire.';
    if (!auteur.trim()) errs.auteur = "L'auteur est obligatoire.";
    if (nbPages.trim()) {
      const n = parseInt(nbPages, 10);
      if (isNaN(n) || n <= 0) errs.nbPages = 'Entier positif requis.';
    }
    if (dateLec.trim() && !DATE_REGEX.test(dateLec.trim())) {
      errs.dateLec = 'Format attendu : JJ/MM/AAAA';
    }
    setErreurs(errs);
    return Object.keys(errs).length === 0;
  }

  async function enregistrer() {
    if (!valider()) return;
    const genreFinal = genre === 'Autre' ? genrePerso.trim() : genre.trim();
    const livre = {
      id:           livreExistant?.id,
      titre:        titre.trim(),
      auteur:       auteur.trim(),
      genre:        genreFinal,
      nb_pages:     parseInt(nbPages, 10) || 0,
      note,
      lu,
      favori:       livreExistant?.favori ?? 0,
      date_lecture: dateLec.trim(),
      photo:        livreExistant?.photo  ?? null,
    };
    try {
      if (livreExistant) await modifierLivre(livre);
      else               await ajouterLivre(livre);
      setModifié(false);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'enregistrer le livre.");
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {/* Titre */}
      <Champ label="Titre *" erreur={erreurs.titre}>
        <TextInput style={[styles.input, erreurs.titre && styles.inputErreur]}
          value={titre} onChangeText={setTitre} placeholder="Titre du livre"
          placeholderTextColor={Colors.textLight} />
      </Champ>

      {/* Auteur */}
      <Champ label="Auteur *" erreur={erreurs.auteur}>
        <TextInput style={[styles.input, erreurs.auteur && styles.inputErreur]}
          value={auteur} onChangeText={setAuteur} placeholder="Nom de l'auteur"
          placeholderTextColor={Colors.textLight} />
      </Champ>

      {/* Genre */}
      <Champ label="Genre">
        <TouchableOpacity style={[styles.input, styles.picker]} onPress={() => setShowGenres(true)}>
          <Text style={genre ? styles.pickerTxt : styles.pickerPlaceholder}>
            {genre || 'Sélectionner un genre…'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        {genre === 'Autre' && (
          <TextInput style={[styles.input, { marginTop: 8 }]}
            value={genrePerso} onChangeText={setGenrePerso}
            placeholder="Précisez le genre…" placeholderTextColor={Colors.textLight} />
        )}
      </Champ>

      {/* Pages */}
      <Champ label="Nombre de pages" erreur={erreurs.nbPages}>
        <TextInput style={[styles.input, erreurs.nbPages && styles.inputErreur]}
          value={nbPages} onChangeText={setNbPages} placeholder="ex : 320"
          placeholderTextColor={Colors.textLight} keyboardType="numeric" />
      </Champ>

      {/* Date */}
      <Champ label="Date de lecture" erreur={erreurs.dateLec}>
        <TextInput style={[styles.input, erreurs.dateLec && styles.inputErreur]}
          value={dateLec} onChangeText={setDateLec} placeholder="JJ/MM/AAAA"
          placeholderTextColor={Colors.textLight} maxLength={10} />
      </Champ>

      {/* Note */}
      <Champ label="Note">
        <View style={styles.etoilesRow}>
          {[1,2,3,4,5].map(i => (
            <TouchableOpacity key={i} onPress={() => setNote(i === note ? 0 : i)}>
              <Ionicons
                name={i <= note ? 'star' : 'star-outline'}
                size={38} color={i <= note ? Colors.gold : Colors.border}
              />
            </TouchableOpacity>
          ))}
          {note > 0 && <Text style={styles.noteLabel}>{note} / 5</Text>}
        </View>
      </Champ>

      {/* Statut */}
      <Champ label="Statut de lecture">
        <View style={styles.statutRow}>
          {[{ v: 1, l: 'Lu', icon: 'checkmark-circle-outline' }, { v: 0, l: 'Non lu', icon: 'book-outline' }].map(s => (
            <TouchableOpacity key={s.v}
              style={[styles.statutBtn, lu === s.v && styles.statutActif]}
              onPress={() => setLu(s.v)}>
              <Ionicons name={s.icon} size={16} color={lu === s.v ? '#fff' : Colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.statutTxt, lu === s.v && styles.statutTxtActif]}>{s.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Champ>

      {/* Bouton enregistrer */}
      <TouchableOpacity style={styles.bouton} onPress={enregistrer}>
        <Ionicons name={livreExistant ? 'save-outline' : 'add-circle-outline'} size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.boutonTxt}>{livreExistant ? 'Enregistrer les modifications' : 'Ajouter le livre'}</Text>
      </TouchableOpacity>

      {/* Modal Genre */}
      <Modal visible={showGenres} transparent animationType="slide" onRequestClose={() => setShowGenres(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitre}>Choisir un genre</Text>
            <ScrollView>
              {GENRES.map(g => (
                <TouchableOpacity key={g}
                  style={[styles.modalOption, genre === g && styles.modalOptionActif]}
                  onPress={() => { setGenre(g); if (g !== 'Autre') setShowGenres(false); }}>
                  {genre === g && <Ionicons name="checkmark" size={16} color={Colors.primary} style={{ marginRight: 8 }} />}
                  <Text style={[styles.modalOptionTxt, genre === g && styles.modalOptionTxtActif]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalFermer} onPress={() => setShowGenres(false)}>
              <Text style={styles.modalFermerTxt}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: Colors.background, padding: 16 },
  champ:               { marginBottom: 16 },
  label:               { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  input:               { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderWidth: 1.5, borderColor: Colors.border, fontSize: 15, color: Colors.textPrimary },
  inputErreur:         { borderColor: Colors.danger },
  erreurRow:           { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  erreurTxt:           { color: Colors.danger, fontSize: 12 },
  picker:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTxt:           { fontSize: 15, color: Colors.textPrimary },
  pickerPlaceholder:   { fontSize: 15, color: Colors.textLight },
  etoilesRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noteLabel:           { marginLeft: 8, fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  statutRow:           { flexDirection: 'row', gap: 10 },
  statutBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 11, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  statutActif:         { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statutTxt:           { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  statutTxtActif:      { color: '#fff', fontWeight: '700', fontSize: 14 },
  bouton:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, padding: 15, borderRadius: Radius.lg, marginTop: 8, marginBottom: 40, ...Shadow.md },
  boutonTxt:           { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:            { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  modalTitre:          { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 },
  modalOption:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderRadius: Radius.md, marginBottom: 2 },
  modalOptionActif:    { backgroundColor: Colors.primaryLight },
  modalOptionTxt:      { fontSize: 15, color: Colors.textSecondary },
  modalOptionTxtActif: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  modalFermer:         { marginTop: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.danger, alignItems: 'center' },
  modalFermerTxt:      { color: '#fff', fontWeight: '700', fontSize: 15 },
});