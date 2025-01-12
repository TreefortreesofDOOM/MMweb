import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/store/product-form';

export default function ArtistStorePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
        <p className="text-muted-foreground">
          Manage your artwork listings and pricing.
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="settings">Store Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
            </CardHeader>
            <CardContent>
              {/* ProductList component will go here */}
              <div className="text-muted-foreground">
                Product management interface coming soon...
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm 
                onSubmit={async (data) => {
                  console.log('Form submitted:', data);
                  // TODO: Implement product creation
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {/* StoreSettings component will go here */}
              <div className="text-muted-foreground">
                Store configuration options coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 