<Drawer.Navigator
        initialRouteName="EscolhaPedidos"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#333', // Fundo do Drawer
          },
          drawerActiveTintColor: 'orange', // Cor do texto e ícone quando selecionado
          drawerInactiveTintColor: 'white', // Cor do texto e ícone quando não selecionado
          headerStyle: {
            backgroundColor: '#222', // Fundo do cabeçalho
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