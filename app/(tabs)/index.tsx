import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import styled from "styled-components/native";

const WEATHER_API_KEY = "";

const Container = styled(SafeAreaView)`
  flex: 1;
  background: #e6eafc;
  padding-top: 34px;
`;

const BackgroundWrapper = styled(View)`
  margin-top: 32px;
  padding: 32px 24px 120px 24px;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  overflow: hidden;
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const WeatherTemp = styled.Text`
  font-size: 80px;
  color: #fff;
  font-weight: bold;
`;

const WeatherDesc = styled.Text`
  color: #fff;
  font-size: 18px;
  position: absolute;
  right: 24px;
  top: 32px;
  transform: rotate(90deg);
  margin-top: 20px;
`;

const WeatherDetails = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
`;

const Detail = styled.View`
  align-items: center;
`;

const Card = styled.View`
  background: #fff;
  margin: -60px 24px 0 24px;
  border-radius: 24px;
  padding: 24px 16px 16px 16px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 5;
`;

const HourlyRow = styled.ScrollView`
  flex-direction: row;
  margin-bottom: 16px;
`;

const HourlyItem = styled.View`
  align-items: center;
  margin-right: 24px;
`;

const TomorrowCard = styled.View`
  background: #f6f7fb;
  border-radius: 16px;
  padding: 16px;
  margin-top: 8px;
`;

export default function HomeScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setErrorMsg(null);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied.");
          setLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        const coords = `${loc.coords.latitude},${loc.coords.longitude}`;
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${coords}&days=2&aqi=no&alerts=no`
        );
        const data = await res.json();
        setWeather(data.current);
        setForecast(data.forecast);
        setLocation(data.location);
      } catch (e) {
        setWeather(null);
        setForecast(null);
        setLocation(null);
        setErrorMsg("Failed to get weather data.");
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Container>
        <ActivityIndicator
          size="large"
          color="#4f5bd5"
          style={{ marginTop: 100 }}
        />
      </Container>
    );
  }

  if (errorMsg) {
    return (
      <Container>
        <Text style={{ marginTop: 100, textAlign: "center" }}>{errorMsg}</Text>
      </Container>
    );
  }

  if (!weather || !forecast) {
    return (
      <Container>
        <Text style={{ marginTop: 100, textAlign: "center" }}>
          Failed to load weather data.
        </Text>
      </Container>
    );
  }

  const current = weather;
  const today = forecast.forecastday[0];
  const tomorrow = forecast.forecastday[1];

  return (
    <Container>
      <BackgroundWrapper>
        <LinearGradient
          colors={["#4f5bd5", "#5f2c82"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            ...StyleSheet.absoluteFillObject,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        />
        <LocationRow>
          <Icon name="location-sharp" size={22} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 18, marginLeft: 8 }}>
            {location?.name}, {location?.country}
          </Text>
        </LocationRow>
        <Text style={{ color: "#fff", fontSize: 14, marginBottom: 8 }}>
          Today, {today.date} {weather?.location?.localtime?.split(" ")[1]}
        </Text>
        <WeatherTemp>{Math.round(current.temp_c)}°C</WeatherTemp>
        <WeatherDesc>{current.condition.text}</WeatherDesc>
        <WeatherDetails>
          <Detail>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              ↑ {Math.round(today.day.maxtemp_c)}°
            </Text>
            <Text style={{ color: "#fff", fontSize: 12 }}>
              ↓ {Math.round(today.day.mintemp_c)}°
            </Text>
          </Detail>
          <Detail>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {today.astro.sunset}
            </Text>
            <Text style={{ color: "#fff", fontSize: 12 }}>Sunset</Text>
          </Detail>
          <Detail>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {current.wind_kph} km/h
            </Text>
            <Text style={{ color: "#fff", fontSize: 12 }}>
              {current.wind_dir}
            </Text>
          </Detail>
          <Detail>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              UVI {current.uv}
            </Text>
            <Text style={{ color: "#fff", fontSize: 12 }}>UV Index</Text>
          </Detail>
        </WeatherDetails>
      </BackgroundWrapper>
      <Card>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
          Hourly Forecast
        </Text>
        <HourlyRow horizontal showsHorizontalScrollIndicator={false}>
          {today.hour.slice(0, 6).map((h: any, idx: number) => (
            <HourlyItem key={h.time_epoch}>
              <Icon
                name={
                  h.condition.text.includes("Rain")
                    ? "rainy"
                    : h.condition.text.includes("Cloud")
                    ? "cloud-outline"
                    : "sunny"
                }
                size={28}
                color={
                  h.condition.text.includes("Rain")
                    ? "#4fc3f7"
                    : h.condition.text.includes("Cloud")
                    ? "#90a4ae"
                    : "#fbc02d"
                }
              />
              <Text>{h.time.split(" ")[1]}</Text>
              <Text style={{ fontWeight: "bold" }}>
                {Math.round(h.temp_c)}°
              </Text>
            </HourlyItem>
          ))}
        </HourlyRow>
        <TomorrowCard>
          <Text style={{ fontWeight: "bold" }}>Tomorrow</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Icon
              name={
                tomorrow.day.condition.text.includes("Rain")
                  ? "rainy-outline"
                  : tomorrow.day.condition.text.includes("Cloud")
                  ? "cloud-outline"
                  : "sunny"
              }
              size={22}
              color={
                tomorrow.day.condition.text.includes("Rain")
                  ? "#4fc3f7"
                  : tomorrow.day.condition.text.includes("Cloud")
                  ? "#90a4ae"
                  : "#fbc02d"
              }
            />
            <Text style={{ marginLeft: 8 }}>{tomorrow.day.condition.text}</Text>
            <Text style={{ marginLeft: 16 }}>
              ↑ {Math.round(tomorrow.day.maxtemp_c)}° ↓{" "}
              {Math.round(tomorrow.day.mintemp_c)}°
            </Text>
          </View>
        </TomorrowCard>
      </Card>
    </Container>
  );
}
