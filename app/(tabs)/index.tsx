import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as rickMortyApi from "rickmortyapi";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
};

type ItemProps = {
  character: Character;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
};

const Item = ({ character, onPress, backgroundColor, textColor }: ItemProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
    <Image source={{ uri: character.image }} style={styles.image} />
    <Text style={[styles.title, { color: textColor }]}>{character.name}</Text>
  </TouchableOpacity>
);

async function getCharactersRickAndMorty() {
  const initialResponse = await rickMortyApi.getCharacters();

  if (initialResponse?.status !== 200 || !initialResponse?.data?.info?.pages) {
    return [];
  }

  const totalPages = initialResponse.data.info.pages;
  const requests = Array.from({ length: totalPages }, (_, i) => rickMortyApi.getCharacters({ page: i + 1 }));

  const responses = await Promise.all(requests);

  return responses.filter((response) => response?.status === 200).flatMap((response) => response.data.results || []);
}

export default function HomeScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCharacters = async () => {
    const data = await getCharactersRickAndMorty();
    setCharacters(data);
  };

  useEffect(() => {
    const initializeCharacters = async () => {
      setLoading(true);
      await loadCharacters();
      setLoading(false);
    };
    initializeCharacters();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCharacters();
    setSelectedId(null);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Character }) => {
    const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
    const color = item.id === selectedId ? "white" : "black";
    return (
      <Item
        character={item}
        onPress={() => setSelectedId(item.id)}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Image source={require("@/assets/images/header.png")} style={styles.logo} />
        <FlatList
          data={characters}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Rick and Morty Characters</ThemedText>
            </ThemedView>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    marginVertical: 20,
    marginHorizontal: 20,
    gap: 8,
  },
  logo: {
    height: "100%",
    width: "100%",
    position: "absolute",
    resizeMode: "center",
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 30,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    marginLeft: 16,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
