import * as React from 'react';
import {
  StatusBar,
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { getMovies } from './API';
import Genres from './components/Genres/Genres';
import Rating from './components/Rating/Rating';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view'
import Svg, { Rect } from 'react-native-svg'

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const SPACING = 10;
const ITEM_SIZE = Platform.OS === 'ios' ? width * 0.72 : width * 0.74;
const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;
const BACKDROP_HEIGHT = height * 0.65;
const SPACER_ITEM_SIZE = (width - ITEM_SIZE) / 2

const Loading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color="#3498db" />
  </View>
);
const Backdrop = ({ movies, scrollX }) => {
  return <View style={{ position: 'absolute', width, height: BACKDROP_HEIGHT }}>
    <FlatList
      data={movies.reverse()}
      keyExtractor={item => item.key}
      removeClippedSubviews={false}
      contentContainerStyle={{ width, height: BACKDROP_HEIGHT }}
      renderItem={({ item, index }) => {
        if (!item.backdrop) {
          return null
        }
        const inputRange = [
          (index - 2) * ITEM_SIZE,
          (index - 1) * ITEM_SIZE
        ]
        const translateX = scrollX.interpolate({
          inputRange,
          outputRange: [0, width + 5]
        })
        return (
          <Animated.View
            removeClippedSubviews={false}
            style={{
              position: 'absolute',
              width: translateX,
              height: height,
              overflow: 'hidden',
            }}
          >
            <Image source={{ uri: item.backdrop }}
              style={{ width, height: BACKDROP_HEIGHT, resizeMode: 'cover', position: 'absolute' }} />
          </Animated.View>);
      }}
    />
    < LinearGradient
      colors={['rgba(0, 0, 0, 0)', 'white']}
      style={{
        height: BACKDROP_HEIGHT,
        width,
        position: 'absolute',
        bottom: 0,
      }}
    />

  </View >
}

export default function App() {

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [movies, setMovies] = React.useState([]);
  React.useEffect(() => {
    const fetchData = async () => {
      /**getMovies from moviesDataBase API */
      const movies = await getMovies();
      setMovies([{ key: 'left-spacer' }, ...movies, { key: 'right-spacer' }])
    }
    if (movies.length === 0) fetchData();
  }, [movies])

  if (movies.length === 0) return <Loading />;

  return (
    <View style={styles.container}>
      <Backdrop movies={movies} scrollX={scrollX} />
      <StatusBar hidden />
      <Animated.FlatList showsHorizontalScrollIndicator={false}
        data={movies}
        keyExtractor={(item) => item.key}
        horizontal
        contentContainerStyle={{
          alignItems: 'center'
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        snapToInterval={ITEM_SIZE}
        decelerationRate={Platform.OS === 'ios' ? 0 : 0.98}
        renderToHardwareTextureAndroid
        bounces={false}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          if (!item.poster) return <View style={{ width: SPACER_ITEM_SIZE }} />;
          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE
          ]
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 50, 100],
            extrapolate: 'clamp'
          })
          return (<View style={{ width: ITEM_SIZE }}>
            <Animated.View style={{ marginHorizontal: SPACING, padding: SPACING * 2, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 34, transform: [{ translateY }] }}>
              <Image source={{ uri: item.poster }} style={styles.posterImage} />
              <Text style={{ fontSize: 24 }} numberOfLines={1}>
                {item.title}
              </Text>
              <Rating rating={item.rating} />
              <Genres genres={item.genres} />
              <Text style={{ fontSize: 12 }} numberOfLines={3}>
                {item.description}
              </Text>
            </Animated.View>
          </View>)
        }} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  posterImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2,
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
});
