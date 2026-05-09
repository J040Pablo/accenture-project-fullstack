import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const PedidosList: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Pedidos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Visualize e processe todos os pedidos realizados no e-commerce.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PedidosList;
