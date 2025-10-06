import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PerformanceChart from './performanceChart';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

export default function StockDetail({ id, setModalVisible }) {
    const { width: windowWidth } = useWindowDimensions();
    const { token } = useAuth();

    const [stockData, setStockData] = useState([]);
    const [dashboardData, setDashboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [messageVisible, setMessageVisible] = useState(false);
    const [messageType, setMessageType] = useState("");
    const [message, setMessage] = useState("");

    if (messageVisible) {
        setTimeout(() => {
            setMessageVisible(false);
        }, 3000);
    }

    const history = stockData.history;

    const [quantity, setQuantity] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const stockRes = await fetch(`http://192.168.1.107:5001/api/stocks/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                });

                if (!stockRes.ok) {
                    setMessageType('error');
                    setMessage("Stock fetch failed! status: " + stockRes.status);
                    setMessageVisible(true);
                    throw new Error(`Stock fetch failed! status: ${stockRes.status}`);
                }
                const stockJson = await stockRes.json();
                setStockData(stockJson);

                const dashboardRes = await fetch(`http://192.168.1.107:5001/api/student/dashboard`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                });

                if (!dashboardRes.ok) {
                    setMessageType('error');
                    setMessage("Dashboard fetch failed! status: " + dashboardRes.status);
                    setMessageVisible(true);
                    throw new Error(`Dashboard fetch failed! status: ${dashboardRes.status}`);
                }
                const dashboardJson = await dashboardRes.json();
                setDashboardData(dashboardJson);

            } catch (error) {
                setMessageType('error');
                setMessage(error.message);
                setMessageVisible(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleTransaction = async (type) => {
        if (quantity <= 0 && type === "buy") {
            setMessageType('error');
            setMessage("Please enter a valid quantity");
            setMessageVisible(true);
            return;
        } else if (quantity <= 0 && type === "sell") {
            setMessageType('error');
            setMessage("Please enter a valid quantity");
            setMessageVisible(true);
            return;
        }

        try {
            const res = await fetch(`http://192.168.1.107:5001/api/stocks/${id}/${type}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "amount": quantity,
                }),
            });

            if (!res.ok) {
                setMessageType('error');
                setMessage("Transaction failed! status: " + res.status);
                setMessageVisible(true);
                throw new Error(`Transaction failed! status: ${res.status}`);
            }
            const message = await res.json();
            setMessageType('success');
            setMessage(message.message);
            setMessageVisible(true);
            setQuantity(0);

        } catch (error) {
            setMessageType('error');
            setMessage(error.message);
            setMessageVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="white" />
            ) : (
                <>
                    <View style={styles.header}>
                        <Ionicons name="arrow-back-sharp" size={30} color="white" onPress={() => setModalVisible(false)} style={styles.backIcon} />
                        <Text style={styles.title}>{stockData.symbol}</Text>
                    </View>
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
                    <Text style={styles.stockTitle}>{stockData.name}</Text>
                    <Text style={styles.stockPrice}>${stockData.current_price}</Text>
                    <Text style={[styles.stockChange, { color: (((stockData.current_price - (history.slice(-5).reduce((sum, val) => sum + val.value, 0)) / 5) / stockData.current_price * 100 < 0 ? '#FF6B6B' : '#8EC57C')) }]}>
                        {(((stockData.current_price - (history.slice(-5).reduce((sum, val) => sum + val.value, 0)) / 5) / stockData.current_price * 100) < 0 ? '' : '+')}
                        {(((stockData.current_price - (history.slice(-5).reduce((sum, val) => sum + val.value, 0)) / 5) / stockData.current_price * 100).toFixed(2))}%
                    </Text>
                    <View style={styles.transactionsContainer}>
                        <TouchableOpacity style={[styles.transactionButton, { backgroundColor: '#5C48DF' }]} onPress={() => handleTransaction('buy')}>
                            <Text style={styles.transactionButtonText}>Buy</Text>
                            <Ionicons name="arrow-down-left-box-outline" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.transactionButton, { borderColor: '#B1B3B4', borderWidth: 1 }]} onPress={() => handleTransaction('sell')}>
                            <Text style={styles.transactionButtonText}>Sell</Text>
                            <Ionicons name="arrow-up-right-box-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buyerInfoContainer}>
                        <View style={styles.buyerInfoItem}>
                            <Text style={styles.buyerInfoLabel}>Select Quantity</Text>
                            <TextInput
                                onChangeText={(quantity) => setQuantity(quantity)}
                                style={styles.buyerInfoInput}
                                placeholder="0"
                                keyboardType="numeric"
                                numberOfLines={1}
                                placeholderTextColor="#B1B3B4"
                                textAlign="left"
                                value={quantity}
                            />
                        </View>
                        <View style={styles.buyerInfoItem}>
                            <Text style={styles.buyerInfoLabel}>Price</Text>
                            {(stockData.current_price * quantity).toFixed(2) < 1 ? (
                                <Text style={styles.buyerInfoValue}>${stockData.current_price}</Text>
                            ) : (
                                <Text style={styles.buyerInfoValue}>${(stockData.current_price * quantity).toFixed(2)}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.buyerInfoLabel}>Information</Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>{stockData.name}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Symbol:</Text>
                            <Text style={styles.infoValue}>{stockData.symbol}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Shares Held:</Text>
                            <Text style={styles.infoValue}>{stockData.shares}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Shares After Purchase:</Text>
                            <Text style={styles.infoValue}>{(parseFloat(stockData.shares) + parseFloat(quantity)).toFixed(0)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Shares To Sell:</Text>
                            {
                                (stockData.shares - quantity) < 0 ?
                                    <Text style={[styles.infoValue, { color: '#FF6B6B' }]}>Not Enough Shares To Sell</Text> :
                                    <Text style={[styles.infoValue, { color: '#8EC57C' }]}>{(stockData.shares - quantity)}</Text>
                            }
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Total Value Of Shares:</Text>
                            <Text style={styles.infoValue}>${(stockData.current_price * stockData.shares).toFixed(2)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Investable Capital:</Text>
                            {
                                (dashboardData.usable_funds - (stockData.current_price * quantity)) < 0 ?
                                    <Text style={[styles.infoValue, { color: '#FF6B6B' }]}>Not Enough Capital To Buy</Text> :
                                    <Text style={[styles.infoValue, { color: '#8EC57C' }]}>${(dashboardData.usable_funds - (stockData.current_price * quantity)).toFixed(2)}</Text>
                            }
                        </View>
                    </View>
                    <View style={{ paddingBlock: 20, width: '100%' }}>
                        <PerformanceChart data={history} width={windowWidth - 50} height={180} />
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingBottom: 50,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        marginBottom: 20,
    },
    backIcon: {
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderColor: '#B1B3B4',
        borderWidth: 1,
        borderRadius: 50,
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
        marginLeft: 30,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    stockTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    stockPrice: {
        fontSize: 42,
        color: 'white',
        marginBottom: 5,
    },
    stockChange: {
        fontSize: 14,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
    },
    transactionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    transactionButton: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
    },
    transactionButtonText: {
        color: 'white',
        fontSize: 16,
    },
    buyerInfoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    buyerInfoItem: {
        width: '45%',
        gap: 5,
        borderColor: '#B1B3B4',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    buyerInfoLabel: {
        color: '#B1B3B4',
        fontSize: 14,
        marginBottom: 10,
    },
    buyerInfoInput: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        outlineColor: 'transparent',
    },
    buyerInfoValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    infoContainer: {
        width: '95%',
        borderColor: '#B1B3B4',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 20,
        gap: 5,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        color: 'white',
        fontSize: 14,
    },
    infoValue: {
        color: 'white',
        fontSize: 14,
    },
});