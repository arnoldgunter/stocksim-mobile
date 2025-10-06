import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Modal, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/AuthContext';
import StockDetail from '../../../components/stockDetail';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings() {
  const { token } = useAuth();
  const { width: windowWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [messageVisible, setMessageVisible] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  setTimeout(() => {
    setMessageVisible(false);
  }, 3000);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://192.168.1.107:5001/api/stocks/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setMessageType('error');
          setMessage("Stock fetch failed! status: " + response.status);
          setMessageVisible(true);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setStocks(data);
      } catch (error) {
        setMessageType('error');
        setMessage("Stock fetch failed! status: " + error.message);
        setMessageVisible(true);
      }
      finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleStockPress = (stockTitle) => {
    setSelectedStock(stockTitle);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {messageVisible && messageType === 'error' ? (
        <View style={[styles.messageContainer, { backgroundColor: '#FF6B6B' }]}>
          <Ionicons name="close-circle" size={30} color="red" />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : messageVisible && messageType === 'success' ? (
        <View style={[styles.messageContainer, { backgroundColor: '#8EC57C' }]}>
          <Ionicons name="checkmark-circle" size={30} color="green" />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingInline: 10, alignItems: 'center' }}>
        <Text style={styles.title}>Stock Market</Text>
        <TextInput
          onChangeText={(searchInput) => setSearchTerm(searchInput)}
          style={styles.searchInput}
          placeholder="Search stocks by name..."
          numberOfLines={1}
          placeholderTextColor="#B1B3B4"
          textAlign="left"
        />
        <View style={styles.cardContainer}>
          {stocks
            .filter((stock) => stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((stock, index) => (
              <TouchableOpacity key={index} style={styles.stockCard} onPress={() => handleStockPress(stock.id)}>
                <View style={styles.stockName}>
                  <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                  <Text style={styles.stockTitle}>{stock.name}</Text>
                </View>
                <Text style={styles.stockValue}>${stock.current_price.toFixed(2)}/Share</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} animationType="slide" presentationStyle="fullScreen">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <LinearGradient
            colors={["#254912", "#111315"]}
            style={[styles.container, { width: windowWidth }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={[0, 0.25, 1]}
          >
            <StockDetail id={selectedStock} setModalVisible={setModalVisible} />
          </LinearGradient>
        </ScrollView>

      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111315',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 30,
  },
  searchInput: {
    width: '100%',
    height: 50,
    borderColor: '#B1B3B4',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 10,
    color: 'white',
  },
  cardContainer: {
    width: '100%',
    paddingBottom: 50
  },

  stockCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    top: 20,
    marginTop: -3,
    backgroundColor: '#1C1E1F',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: '#B1B3B4',
    borderWidth: 1,
  },

  stockName: {
    flexDirection: 'column',
    maxWidth: '60%',
  },

  stockTitle: {
    fontSize: 14,
    color: '#B1B3B4',
  },

  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },

  stockValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },

});
