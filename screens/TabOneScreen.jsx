import React, { useState, useEffect, useContext } from "react";
import AppContext from "../global/AppContext";

import { Ionicons } from "@expo/vector-icons";

import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ColorSchemeName,
  TouchableNativeFeedback,
  Button,
} from "react-native";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { ProgressBar, Colors, Headline, Appbar } from "react-native-paper";
import { Item } from "react-native-paper";
import { useFonts, Nunito_400Regular } from "@expo-google-fonts/inter";

export default function TabOneScreen({
  navigation,
  colorScheme,
}: {
  navigation: any,
  colorScheme: ColorSchemeName,
}) {
  const [torrents, setTorrents] = useState([]);
  const [clinetInfo, setClientInfo] = useState([]);

  const userSettings: any = useContext(AppContext);

  const loginQbit = async () => {
    var formdata = new FormData();
    formdata.append("username", "jbcbro");
    formdata.append("password", "jonas1209");

    var requestOptions = {
      method: "POST",
      redirect: "follow",
      body: formdata,
    };
    fetch(
      (userSettings.ssl == "true" ? "https://" : "http://") +
        userSettings.host +
        ":" +
        userSettings.port +
        "/api/v2/auth/login?username=" +
        userSettings.username +
        "&password=" +
        userSettings.password +
        "",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log("risultati", result))
      .then(() => getTorrentsQbit())
      .catch((error) => console.log("error", error));
  };

  const getTorrentsQbitInfo = async () => {
    console.log(clinetInfo);
    var myHeaders = new Headers();

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
    };
    await fetch(
      (userSettings.ssl == "true" ? "https://" : "http://") +
        userSettings.host +
        ":" +
        userSettings.port +
        "/api/v2/transfer/info",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => setClientInfo(result))
      .catch((error) => console.log("error", error));
  };

  const getTorrentsQbit = async () => {
    var myHeaders = new Headers();

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    getTorrentsQbitInfo();

    await fetch(
      (userSettings.ssl == "true" ? "https://" : "http://") +
        userSettings.host +
        ":" +
        userSettings.port +
        "/api/v2/torrents/info?sort=added_on&reverse=true",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => setTorrents(result))
      .then((result) => console.log("Recicved"))
      .then(() => setRefreshed(false))
      .catch((error) => console.log("error", error));
  };

  React.useEffect(() => {
    loginQbit();

    const timer = setInterval(() => getTorrentsQbit(), 90000);

    const timerInfo = setInterval(() => getTorrentsQbitInfo(), 90000);

    const unsubscribe = navigation.addListener("focus", () => {
      getTorrentsQbit();
      getTorrentsQbitInfo();
    });

    return unsubscribe;
  }, [navigation]);

  const onPress = (click: any) =>
    console.log(click) + navigation.navigate("InfoScreen", { data: click });
  const onPressLong = (clickL: any) => setRefreshed(false);

  const [refreshed, setRefreshed] = useState(false);

  const onRefresh = () => {
    setRefreshed(true);
    getTorrentsQbit();
  };

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 B";
    if (bytes === NaN) return "0 B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  const ContentTitle = ({ title, style }) => (
    <Appbar.Content
      title={<Text style={style}> {title} </Text>}
      style={{ alignItems: "center" }}
    />
  );
  const _handleMore = () => navigation.navigate("UploadScreen");

  return (
    <View style={styles.container}>
      <Appbar.Header
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        style={{ top: 0, backgroundColor: "#0c0c13", paddingTop: 30, flexDirection:"column", alignItems:"left", height:110 }}
      >
        <Text
          style={{
            marginLeft: 20,
            color: "#fff",
            fontSize: 36,
            fontWeight: "bold",
      
          }} 
        >
          Your qBittorrent
        </Text>
        <Text
          style={{
            marginLeft: 20,
            color: "#6bea99",
            fontSize: 36,
            fontWeight: "bold",
          }} 
        >
          Streams
        </Text>
        </Appbar.Header>
      <Appbar.Header
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        style={{ top: 0, backgroundColor: "#0c0c13", paddingTop: 0, height:60 }}
      >
        
        <View
          style={{
            backgroundColor: "transparent",
            top: 0,
            flexDirection: "row",
            paddingTop: 0,
          }}
        >
          <Text style={{ marginLeft: 20, color: "#349cf4", fontSize: 26 }}>
            ↑
            {clinetInfo.up_info_speed == null
              ? "0"
              : formatBytes(clinetInfo.up_info_speed)}
            /s
          </Text>

          <Text style={{ marginLeft: 20, color: "#6bea99", fontSize: 26 }}>
            ↓
            {clinetInfo.dl_info_speed == null
              ? "0"
              : formatBytes(clinetInfo.dl_info_speed)}
            /s
          </Text>
        </View>
        <ContentTitle title={""} style={{ color: "white" }} />
        <Appbar.Action
          icon="plus"
          onPress={_handleMore}
          style={{ color: "#fff" }}
        />
      </Appbar.Header>

      <FlatList
        data={torrents}
        onRefresh={() => onRefresh()}
        refreshing={refreshed}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => onPress(item)}
            onLongPress={() => onPressLong(item.name)}
          >
            <View
             style={{ justifyContent:"left", width:"90%" }}
            >
            <Text
              style={{ textAlign: "left", marginBottom: 5, fontWeight:"bold" }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {(() => {
          
                if (item.state == "downloading") {
                  return <ProgressBar
                  style={{ height: 5, width: "100%", borderRadius: 20 }}
                  color="#349cf4"
                  progress={item.progress}
                />;
                }

                if (item.state == "pausedDL") {
                  return <ProgressBar
                  style={{ height: 5, width: "100%", borderRadius: 20 }}
                  color="#aaa"
                  progress={item.progress}
                />;
                }
           

                return <ProgressBar
                style={{ height: 5, width: "100%", borderRadius: 20 }}
                color="#6bea99"
                progress={item.progress}
              />;
              })()}
            
           

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {(() => {
                if (item.state == "stalledUP") {
                  return <Text style={styles.markdown}>Seeding</Text>;
                }
                if (item.state == "pausedDL") {
                  return <Text style={styles.markdown}>Paused</Text>;
                }
                if (item.state == "uploading") {
                  return <Text style={styles.markdown}>Seeding</Text>;
                }
                if (item.state == "downloading") {
                  return <Text style={styles.markdown}>Downloading</Text>;
                }
                if (item.state == "metaDL") {
                  return <Text style={styles.markdown}>Checking Metadata</Text>;
                }

                return <Text style={styles.markdown}>{item.state}</Text>;
              })()}

              <Text style={styles.markdown}>
                ↑ {formatBytes(item.uploaded)} ↓ {formatBytes(item.downloaded)}
              </Text>
            </View>
              </View>
              <View
             style={{ justifyContent:"center", textAlign: "right",  alignItems:"flex-end", width:"10%"}}>
            
            <Ionicons name="chevron-forward-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={({ hash }, index) => hash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"flex-start",
    height: "100%",
    paddingTop: 0,
  },
  row: {
    flex: 1,
    marginTop: 20,
    justifyContent: "center",
    marginLeft: 25,
    marginRight: 25,
    flexDirection: "row",
    marginBottom: 20
  },
  markdown: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 7,
    marginBottom: 7,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
