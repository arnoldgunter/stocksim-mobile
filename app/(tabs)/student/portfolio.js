import { useEffect, useState, useCallback, useMemo } from 'react';
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
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PerformanceChart from '../../../components/performanceChart';
import StockDetail from '../../../components/stockDetail';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter } from 'expo-router';
import { PieChart } from 'react-native-gifted-charts';


export default function Portfolio() {
  const router = useRouter();
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [portfolioData, setPortfolioData] = useState([]);
  const [studentStocks, setStudentStocks] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);

  const [messageVisible, setMessageVisible] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  if (messageVisible) {
    setTimeout(() => {
      setMessageVisible(false);
    }, 3000);
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const { width: windowWidth } = useWindowDimensions();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

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

      const dashBoardRes = await fetch("http://192.168.1.107:5001/api/student/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!dashBoardRes.ok) {
        setMessageType('error');
        setMessage("Stocks fetch failed! status: " + dashBoardRes.status);
        setMessageVisible(true);
        throw new Error(`Stocks fetch failed! status: ${dashBoardRes.status}`);
      }
      const dashboardJson = await dashBoardRes.json();
      setDashboardData(dashboardJson);

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

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

  // ✅ useMemo: Berechne einmalig bei studentStocks-Änderung
  const portfolioComposition = useMemo(() => {
    if (!studentStocks || studentStocks.length === 0) return [];

    const totalValue = studentStocks.reduce(
      (sum, stock) => sum + stock.current_price * stock.quantity,
      0
    );

    return studentStocks.map((stock) => {
      const stockValue = parseInt((stock.current_price * stock.quantity).toFixed(2));
      return {
        value: stockValue,
        percentage: (stockValue / totalValue) * 100,
        color: getRandomColor(),
        label: stock.name,
      };
    });
  }, [studentStocks]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingInline: 10, width: '100%', alignItems: 'center' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }>
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

        <Text style={styles.title}>Portfolio</Text>

        <Text style={styles.label}>Investable Capital</Text>
        <Text style={styles.value}>${dashboardData.usable_funds}</Text>
        <Text style={styles.label}>Invested In Stocks</Text>
        <Text style={styles.value}>${dashboardData.invested}</Text>

        <View style={styles.cardContainer}>
          <Text style={styles.cardContainerTitle}>Portfolio Performance</Text>
          <PerformanceChart data={portfolioData} width={windowWidth - 60} height={200} />
        </View>

        <View style={styles.cardContainer}>

          <Text style={styles.cardContainerTitle}>Portfolio Composition</Text>
          <View style={styles.cardContainer}>

            {portfolioComposition.length > 0 && (
              <>
                <PieChart
                  data={portfolioComposition.map((item) => ({
                    value: item.value,
                    color: item.color,
                  }))}
                  radius={(windowWidth - 50) / 2}
                  showText
                  textColor="white"
                  textSize={14}
                  showValuesAsLabels
                  focusOnPress
                />
                <View style={styles.legendContainer}>
                  {portfolioComposition.sort((a, b) => b.percentage - a.percentage).map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                      <Text style={styles.legendLabel}>
                        {item.label}: {item.percentage.toFixed(2)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

        </View>


        <View style={styles.cardContainer}>
          <Text style={styles.cardContainerTitle}>My Stocks</Text>
          <TextInput
            onChangeText={(searchInput) => setSearchTerm(searchInput)}
            style={styles.searchInput}
            placeholder="Search stocks by name..."
            numberOfLines={1}
            placeholderTextColor="#B1B3B4"
            textAlign="left"
          />
          {studentStocks
            .filter((stock) => stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    width: '100%',
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

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 30,
  },

  dashboardInfoContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  label: {
    width: '100%',
    fontSize: 14,
    color: '#B1B3B4',
  },

  value: {
    width: '100%',
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },

  cardContainer: {
    width: '100%',
    marginBlock: 20,
    paddingBottom: 20,
    alignItems: 'center'
  },

  cardContainerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },

  legendContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "column",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    color: "white",
    fontSize: 14,
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

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5C48DF',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 20
  },

  logoutText: {
    color: 'white',
    fontSize: 16
  }
});
