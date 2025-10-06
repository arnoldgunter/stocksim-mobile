import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, useWindowDimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect } from 'react';
import PerformanceChart from './performanceChart';

export default function StudentDetail({ username, password, funds, id }) {
    const { width: windowWidth } = useWindowDimensions();

    const { token } = useAuth();

    const [loading, setLoading] = useState(false);

    const [newPassword, setNewPassword] = useState('');

    const [addFundValue, setAddFundValue] = useState(0);

    const [portfolioData, setPortfolioData] = useState([]);

    const [message, setMessage] = useState('');
    const [messageVisible, setMessageVisible] = useState(false);
    const [messageType, setMessageType] = useState('');

    if (messageVisible) {
        setTimeout(() => {
            setMessageVisible(false);
        }, 3000);
    }

    const handlePasswordChange = async () => {
        try {
            const response = await fetch(`http://192.168.1.107:5001/api/teacher/student/${id}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ new_password: newPassword }),

            });

            if (!response.ok) {
                setMessageType('error');
                setMessage("Password change failed! status: " + response.status);
                setMessageVisible(true);
                throw new Error('Network response was not ok');
            }


        } catch (error) {
            setMessageType('error');
            setMessage("Password change failed! status: " + error.message);
            setMessageVisible(true);
        }
        finally {
            setMessageType('success');
            setMessage("Password changed successfully!");
            setMessageVisible(true);
            setNewPassword('');
        }
    };

    const handleFundAdd = async () => {
        try {
            const response = await fetch(`http://192.168.1.107:5001/api/teacher/student/${id}/add-funds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: addFundValue }),

            });

            if (!response.ok) {
                setMessageType('error');
                setMessage("Fund addition failed! status: " + response.status);
                setMessageVisible(true);
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            setMessageType('error');
            setMessage("Fund addition failed! status: " + error.message);
            setMessageVisible(true);
        }
        finally {
            setMessageType('success');
            setMessage("Fund added successfully!");
            setMessageVisible(true);
            setAddFundValue(0);
        }
    };

    const handleStudentDelete = async () => {
        Alert.alert(
            'Confirm deletion',
            'Are you sure you want to delete this student?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => console.log('Cancel Pressed'),
                },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            const response = await fetch(`http://192.168.1.107:5001/api/teacher/delete-student/${id}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            if (!response.ok) {
                                setMessageType('error');
                                setMessage("Student deletion failed! status: " + response.status);
                                setMessageVisible(true);
                                throw new Error('Network response was not ok');
                            }

                        } catch (error) {
                            setMessageType('error');
                            setMessage("Student deletion failed! status: " + error.message);
                            setMessageVisible(true);
                        }
                        finally {
                            setMessageType('success');
                            setMessage("Student deleted successfully!");
                            setMessageVisible(true);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
        
    };

    const fetchPortfolioData = async () => {
        try {
            setLoading(true);

            const portfolioRes = await fetch(`http://192.168.1.107:5001/api/teacher/student-portfolio/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const portfolioJson = await portfolioRes.json();
            setPortfolioData(portfolioJson);

            if (!portfolioRes.ok) {
                setMessageType('error');
                setMessage("Portfolio fetch failed! status: " + portfolioRes.status);
                setMessageVisible(true);
                throw new Error(`Portfolio fetch failed! status: ${portfolioRes.status}`);
            }

        }

        catch (error) {
            setMessageType('error');
            setMessage("Portfolio fetch failed! status: " + error.message);
            setMessageVisible(true);
        }

        finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        setPortfolioData([]);
        fetchPortfolioData();
    }, [id]);


    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
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

            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={150} color="#8EC57C" />
                <Text style={styles.title}>{username}</Text>
            </View>
            <Text style={styles.label}>Password</Text>
            <Text style={styles.text}>{password}</Text>
            <TextInput
                style={styles.textInput}
                placeholder='Enter new password...'
                placeholderTextColor='#B1B3B4'
                editable={true}
                onChangeText={setNewPassword}
                value={newPassword}
            />
            <TouchableOpacity style={styles.setPasswordButton} onPress={handlePasswordChange}>
                <Ionicons name="checkmark" size={24} color="white" />
                <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Funds</Text>
            <Text style={styles.text}>${funds.toFixed(2)}</Text>
            <TextInput
                style={styles.textInput}
                placeholder='Enter funds to add...'
                placeholderTextColor='#B1B3B4'
                keyboardType='numeric'
                onChangeText={setAddFundValue}
                value={addFundValue}
            />
            <TouchableOpacity style={styles.setPasswordButton} onPress={handleFundAdd}>
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.buttonText}>Add Funds</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Portfolio Value</Text>
            <Text style={styles.text}>
                {portfolioData.portfolio_performance && portfolioData.portfolio_performance.length > 0
                    ? `$${portfolioData.portfolio_performance[portfolioData.portfolio_performance.length - 1].value.toFixed(2)}`
                    : "—"}
            </Text>

            <Text style={styles.label}>Portfolio Performance</Text>
            {portfolioData.portfolio_performance && portfolioData.portfolio_performance.length > 0
                ? <PerformanceChart data={portfolioData.portfolio_performance} width={windowWidth - 70} height={180} span={"1D"} />
                : <Text style={styles.text}>This student doesn't own any stocks!</Text>
            }

            <Text style={styles.label}>Stocks</Text>
            {portfolioData.portfolio && portfolioData.portfolio.length > 0 ? (
                <View style={styles.cardContainer}>
                    {portfolioData.portfolio
                        .map((stock, index) => (
                            <View key={index} style={styles.stockCard} onPress={() => handleStockPress(stock.id)}>
                                <View style={styles.stockName}>
                                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                                    <Text style={styles.stockTitle}>{stock.name}</Text>
                                </View>
                                <View style={styles.stockValueContainer}>
                                    <Text style={styles.stockValue}>${stock.current_price.toFixed(2)}/Share</Text>
                                    <Text style={styles.stockChange}>Shares: {stock.quantity}</Text>
                                </View>
                            </View>
                        ))}
                </View>
            ) : <Text style={styles.text}>This student doesn't own any stocks!</Text>}

            <TouchableOpacity style={styles.deleteStudentButton} onPress={handleStudentDelete}>
                <Ionicons name="trash-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Delete Student</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingInline: 20,
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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    text: {
        fontSize: 24,
        color: 'white',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        color: '#B1B3B4',
        marginBottom: 5,
    },
    textInput: {
        width: '100%',
        height: 50,
        borderColor: '#B1B3B4',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        color: 'white',
    },
    setPasswordButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#5C48DF',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 30,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 10,
    },

    deleteStudentButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#DF5C5C',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 30,
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
