import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PerformanceChart from '../../../components/performanceChart';
import StockDetail from '../../../components/stockDetail';
import { useAuth } from '../../../lib/AuthContext';

export default function Home() {
  const { token } = useAuth();

  const { width: windowWidth } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [portfolioData, setPortfolioData] = useState([]);
  const [studentStocks, setStudentStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [messageVisible, setMessageVisible] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  if (messageVisible) {
    setTimeout(() => {
      setMessageVisible(false);
    }, 5000);
  }

  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const portfolioRes = await fetch("http://192.168.1.107:5001/api/student/portfolio-history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!portfolioRes.ok) {
        setMessageType('error');
        setMessage("Portfolio fetch failed! status: " + portfolioRes.status);
        setMessageVisible(true);
        throw new Error(`Portfolio fetch failed! status: ${portfolioRes.status}`);
      }
      const portfolioJson = await portfolioRes.json();
      setPortfolioData(portfolioJson);

      // Student Stocks laden
      const stocksRes = await fetch("http://192.168.1.107:5001/api/student/stocks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!stocksRes.ok) {
        setMessageType('error');
        setMessage("Stocks fetch failed! status: " + stocksRes.status);
        setMessageVisible(true);
        throw new Error(`Stocks fetch failed! status: ${stocksRes.status}`);
      }
      const stocksJson = await stocksRes.json();
      setStudentStocks(stocksJson);

    } catch (error) {
      setMessageType('error');
      setMessage(error.message);
      setMessageVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStockPress = (stockTitle) => {
    setSelectedStock(stockTitle);
    setModalVisible(true);
  };

  if (loading || !portfolioData.length || !studentStocks.length) {
    setTimeout(() => {
      return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center' }]} edges={['top']}>
          <ActivityIndicator size="large" color="white" />
        </SafeAreaView>
      );
    }, 3000);
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ScrollView
        contentContainerStyle={{ paddingInline: 20, paddingTop: 50 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }
      >
          <Text style={styles.currentValue}>You don't own any stocks currently!</Text>
          <Text style={styles.title}>Go to the stocks tab to buy some, come back and refresh this page!</Text>
        </ScrollView>
      </SafeAreaView>
    )

  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingInline: 5 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }
      >
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

        <View style={styles.header}>
          <Text style={styles.title}>Current Portfolio Value</Text>
          <Text style={styles.currentValue}>${portfolioData[portfolioData.length - 1].value.toFixed(2)}</Text>
        </View>

        <PerformanceChart data={portfolioData} width={windowWidth - 50} height={180} span={"1D"} />

        <View style={styles.cardContainer}>
          <Text style={styles.cardContainerTitle}>My Top Value Stocks</Text>
          {studentStocks
            .sort((a, b) => b.current_price - a.current_price)
            .slice(0, 5)
            .map((stock, index) => (
              <TouchableOpacity key={index} style={styles.stockCard} onPress={() => handleStockPress(stock.id)}>
                <Text style={styles.stockTitle}>{stock.name}</Text>
                <View style={styles.stockValueContainer}>
                  <Text style={styles.stockValue}>${stock.current_price.toFixed(2)}/Share</Text>
                  <Text style={styles.stockChange}>
                    Shares: {stock.quantity}
                  </Text>
                </View>
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

  messageContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBlock: 5,
    marginBottom: 20,
    borderRadius: 10,
  },

  messageText: {
    fontSize: 14,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B1B3B4',
  },

  currentValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },

  cardContainer: {
    marginBlock: 20,
    paddingBottom: 20,
  },

  cardContainerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
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

  stockTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    maxWidth: '60%',
  },

  stockValueContainer: {
    alignItems: 'flex-end',
    gap: 5
  },

  stockValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },

  stockChange: {
    fontSize: 15,
    color: '#B1B3B4',
  },
});

