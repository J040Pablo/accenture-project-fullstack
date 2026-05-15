import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

import Dashboard from '../pages/Dashboard/Dashboard';
import ClientesList from '../pages/Clientes/ClientesList';
import ProdutosList from '../pages/Produtos/ProdutosList';
import PedidosList from '../pages/Pedidos/PedidosList';
import Contas from '../pages/Contas/Contas';
import AnaliseRisco from '../pages/AnaliseRisco/AnaliseRisco';
import Relatorios from '../pages/Relatorios/Relatorios';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<ClientesList />} />
        <Route path="produtos" element={<ProdutosList />} />
        <Route path="pedidos" element={<PedidosList />} />
        <Route path="contas" element={<Contas />} />
        <Route path="analise-risco" element={<AnaliseRisco />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
    </Routes>
  );
};
