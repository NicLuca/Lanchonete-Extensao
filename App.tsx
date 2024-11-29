import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons'; // Biblioteca de ícones
import EscolhaPedidos from './screens/EscolhaPedidos';
import HistoricoPedidos from './screens/HistoricoPedidos';
import Estoque from './screens/EstoqueScreen';



const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="EscolhaPedidos"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#c79f10', // Fundo do Drawer
          },
          drawerActiveTintColor: 'black', // Cor do texto e ícone quando selecionado
          drawerInactiveTintColor: 'white', // Cor do texto e ícone quando não selecionado
          headerStyle: {
            backgroundColor: '#c79f10', // Fundo do cabeçalho
          },
          headerTintColor: 'white', // Cor do título no cabeçalho
        }}
      >
        <Drawer.Screen
          name="EscolhaPedidos"
          component={EscolhaPedidos}
          options={{
            title: 'Escolha de Pedidos',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="restaurant-menu" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="HistoricoPedidos"
          component={HistoricoPedidos}
          options={{
            title: 'Histórico de Pedidos',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="list-alt" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Estoque"
          component={Estoque}
          options={{
            title: 'Estoque',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="inventory" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;