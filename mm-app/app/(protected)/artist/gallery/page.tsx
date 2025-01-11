import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GalleryShowForm } from '@/components/gallery/show-form';
import { ArtworkSelector } from '@/components/gallery/artwork-selector';

export default function ArtistGalleryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
        <p className="text-muted-foreground">
          Manage your gallery shows and artwork placement.
        </p>
      </div>

      <Tabs defaultValue="shows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shows">Gallery Shows</TabsTrigger>
          <TabsTrigger value="artworks">Wall Placement</TabsTrigger>
        </TabsList>

        <TabsContent value="shows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Gallery Show</CardTitle>
            </CardHeader>
            <CardContent>
              <GalleryShowForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wall Classifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ArtworkSelector showWallType />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 