import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path } from 'react-native-svg';
import { useMemo } from 'react';

function AnimatedTabIcon({ 
  name, 
  outlineName, 
  focused, 
  size = 24,
  index,
  totalTabs = 5,
}: { 
  name: string; 
  outlineName: string; 
  focused: boolean; 
  size?: number;
  index?: number;
  totalTabs?: number;
}) {


  return (
    <View style={styles.iconWrapper}>
      <MotiView
        from={{
          scale: 0.8,
          translateY: 0,
        }}
        animate={{
          scale: focused ? 1 : 0.8,
          translateY: focused ? -15 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200,
        }}
        style={[
          styles.raisedCircle,
          { 
            backgroundColor: focused ? Colors.primary : 'transparent',
          }
        ]}
      />

      <MotiView 
        from={{
          scale: 1,
          translateY: 0,
        }}
        animate={{
          scale: focused ? 1.1 : 1,
          translateY: focused ? -15 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200,
        }}
        style={{ zIndex: 10 }}
      >
        <Ionicons
          name={(focused ? name : outlineName) as any}
          size={focused ? 28 : size}
          color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
        />
      </MotiView>
    </View>
  );
}

function CurvedTabBar({ 
  state, 
  descriptors, 
  navigation 
}: any) {
  const primaryColor = Colors.primary;
  const focusedIndex = state.index;
  const totalTabs = state.routes.length;

  const curvePosition = useMemo(() => {
    const tabWidth = 100 / totalTabs;
    const centerPosition = (focusedIndex + 0.5) * tabWidth;
    return centerPosition;
  }, [focusedIndex, totalTabs]);

  const svgPath = useMemo(() => {
    const width = 375;
    const height = 70;
    const curveWidth = 90;
    const curveDepth = 45;
    
    const tabWidth = width / totalTabs;
    const centerX = (focusedIndex + 0.5) * tabWidth;
    
    const startCurveX = centerX - curveWidth / 2;
    const endCurveX = centerX + curveWidth / 2;
    
    return `
      M 0,0 
      L ${startCurveX},0
      Q ${startCurveX},0 ${startCurveX + 10},5
      Q ${centerX - 20},${curveDepth} ${centerX},${curveDepth}
      Q ${centerX + 20},${curveDepth} ${endCurveX - 10},5
      Q ${endCurveX},0 ${endCurveX},0
      L ${width},0
      L ${width},${height}
      L 0,${height}
      Z
    `;
  }, [focusedIndex, totalTabs]);

  return (
    <View style={styles.tabBarContainer}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 375 70"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFillObject}
      >
        <Path
          d={svgPath}
          fill={primaryColor}
        />
      </Svg>

      <View style={styles.tabsRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const IconComponent = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {IconComponent && (
                  <IconComponent 
                    focused={isFocused}
                    color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                    size={24}
                    index={index}
                    totalTabs={totalTabs}
                  />
                )}

                {!isFocused && options.title && (
                  <Text style={styles.tabLabel}>{options.title}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {


  return (
    <Tabs
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang Chủ',
          tabBarIcon: (props: any) => (
            <AnimatedTabIcon
              name="home"
              outlineName="home-outline"
              focused={props.focused}
              index={props.index}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-leagues"
        options={{
          title: 'Giải Đấu',
          tabBarIcon: (props: any) => (
            <AnimatedTabIcon
              name="trophy"
              outlineName="trophy-outline"
              focused={props.focused}
              index={props.index}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu Thích',
          tabBarIcon: (props: any) => (
            <AnimatedTabIcon
              name="heart"
              outlineName="heart-outline"
              focused={props.focused}
              index={props.index}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create-league"
        options={{
          title: 'Tạo Giải',
          tabBarIcon: (props: any) => (
            <AnimatedTabIcon
              name="add-circle"
              outlineName="add-circle-outline"
              focused={props.focused}
              index={props.index}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá Nhân',
          tabBarIcon: (props: any) => (
            <AnimatedTabIcon
              name="person"
              outlineName="person-outline"
              focused={props.focused}
              index={props.index}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 80,
    backgroundColor: 'transparent',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    // minHeight: 60,
    marginTop:-10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    position: 'relative',
  },
  raisedCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0,
    overflow: 'hidden',
    zIndex: 2,
  },
  tabLabel: {
    marginTop: -10,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
