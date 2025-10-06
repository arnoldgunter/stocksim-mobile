import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';


export default function PerformanceChart({ data, width, height, span }) {
    const { width: windowWidth } = useWindowDimensions();
    const [timeSpan, setTimeSpan] = useState(span || "1D");

    const ranges = {
        "1D": 24 * 60 * 60 * 1000,
        "1W": 7 * 24 * 60 * 60 * 1000,
        "1M": 30 * 24 * 60 * 60 * 1000,
        "1Y": 365 * 24 * 60 * 60 * 1000,
        "ALL": null,
    };

    const filteredData = useMemo(() => {
        let filtered = timeSpan === "ALL" ? data : data.filter(d => new Date(d.timestamp) >= new Date(Date.now() - ranges[timeSpan]));

        if (filtered.length <= 2) return filtered.map(d => ({ value: d.value || 0, timestamp: d.timestamp }));

        const step = Math.ceil(filtered.length / (windowWidth - 50));
        const downsampled = filtered.filter((_, index) => index % step === 0);

        return downsampled.map(d => ({ value: d.value || 0, timestamp: d.timestamp }));
    }, [timeSpan, data, windowWidth]);

    return (
        <>
            <LineChart
                width={width}
                height={height}
                adjustToWidth={true}
                thickness={2}
                dataPointsRadius={0}
                color="#8EC57C"
                noOfSections={3}
                areaChart
                yAxisTextStyle={{ color: '#B1B3B4' }}
                xAxisLabelTextStyle={{ color: '#B1B3B4' }}
                data={filteredData}
                curved
                rotateLabel={false}
                isAnimated
                animateOnDataChange
                startFillColor={'#8EC57C'}
                endFillColor={'transparent'}
                startOpacity={0.9}
                endSpacing={0}
                endOpacity={0}
                backgroundColor="transparent"
                rulesColor="#B1B3B4"
                rulesType="dotted"
                initialSpacing={0}
                xAxisColor={'transparent'}
                yAxisColor={'transparent'}
            />

            <View style={styles.xLabelContainer}>
                {filteredData.length > 0 && (
                    timeSpan === "1D" || timeSpan === "1M" || timeSpan === "1W" ? (
                        <>
                            <Text style={styles.xLabel}>
                                {new Intl.DateTimeFormat("default", { year: "numeric", month: "short", day: "numeric" })
                                    .format(new Date(filteredData[0]?.timestamp))}
                            </Text>
                            <Text style={styles.xLabel}>
                                {new Intl.DateTimeFormat("default", { year: "numeric", month: "short", day: "numeric" })
                                    .format(new Date(filteredData[filteredData.length - 1]?.timestamp))}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.xLabel}>
                                {new Intl.DateTimeFormat("default", { year: "numeric", month: "short" })
                                    .format(new Date(filteredData[0]?.timestamp))}
                            </Text>
                            <Text style={styles.xLabel}>
                                {new Intl.DateTimeFormat("default", { year: "numeric", month: "short" })
                                    .format(new Date(filteredData[filteredData.length - 1]?.timestamp))}
                            </Text>
                        </>
                    )
                )}
            </View>


            <View style={styles.radioButtonContainer}>
                {["1D", "1W", "1M", "1Y", "ALL"].map(span => (
                    <TouchableOpacity
                        key={span}
                        style={[styles.radioButton, timeSpan === span && { backgroundColor: '#5C48DF' }]}
                        onPress={() => setTimeSpan(span)}
                    >
                        <Text style={[styles.radioButtonText, timeSpan === span && { color: 'white' }]}>{span}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    xLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 30, width: '100%' },
    xLabel: { fontSize: 12, color: '#B1B3B4' },
    radioButtonContainer: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#B1B3B4",
        borderRadius: 50,
        padding: 3,
        marginInline: 'auto',
        marginTop: 30,
        marginBottom: 20,
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "20%",
        height: 45,
        borderRadius: 50,
    },
    radioButtonText: { fontSize: 14, color: "#B1B3B4" },
});