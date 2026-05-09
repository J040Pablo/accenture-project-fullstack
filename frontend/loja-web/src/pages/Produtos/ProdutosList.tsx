import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ProdutosList: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Produtos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">CRUD e listagem completa dos produtos da loja.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProdutosList;
