
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Users } from 'lucide-react';
import { Reference } from '@/types/resume';

interface ReferencesFormProps {
  data: Reference[];
  onChange: (references: Reference[]) => void;
}

export const ReferencesForm: React.FC<ReferencesFormProps> = ({ data, onChange }) => {
  const addReference = () => {
    const newReference: Reference = {
      id: Date.now().toString(),
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      relationship: ''
    };
    onChange([...data, newReference]);
  };

  const updateReference = (id: string, field: keyof Reference, value: string) => {
    onChange(data.map(ref => 
      ref.id === id ? { ...ref, [field]: value } : ref
    ));
  };

  const removeReference = (id: string) => {
    onChange(data.filter(ref => ref.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">References</h3>
        </div>
        <Button onClick={addReference} size="sm" className="flex items-center space-x-1">
          <Plus className="h-4 w-4" />
          <span>Add Reference</span>
        </Button>
      </div>

      {data.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No references added yet</p>
              <Button onClick={addReference} variant="outline" className="mt-2">
                Add Your First Reference
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data.map((reference) => (
        <Card key={reference.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Reference {data.indexOf(reference) + 1}</span>
              <Button
                onClick={() => removeReference(reference.id)}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`ref-name-${reference.id}`}>Full Name *</Label>
                <Input
                  id={`ref-name-${reference.id}`}
                  value={reference.name}
                  onChange={(e) => updateReference(reference.id, 'name', e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <Label htmlFor={`ref-title-${reference.id}`}>Job Title *</Label>
                <Input
                  id={`ref-title-${reference.id}`}
                  value={reference.title}
                  onChange={(e) => updateReference(reference.id, 'title', e.target.value)}
                  placeholder="Senior Manager"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`ref-company-${reference.id}`}>Company *</Label>
                <Input
                  id={`ref-company-${reference.id}`}
                  value={reference.company}
                  onChange={(e) => updateReference(reference.id, 'company', e.target.value)}
                  placeholder="ABC Corporation"
                />
              </div>
              
              <div>
                <Label htmlFor={`ref-relationship-${reference.id}`}>Relationship *</Label>
                <Input
                  id={`ref-relationship-${reference.id}`}
                  value={reference.relationship}
                  onChange={(e) => updateReference(reference.id, 'relationship', e.target.value)}
                  placeholder="Direct Supervisor"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`ref-email-${reference.id}`}>Email *</Label>
                <Input
                  id={`ref-email-${reference.id}`}
                  type="email"
                  value={reference.email}
                  onChange={(e) => updateReference(reference.id, 'email', e.target.value)}
                  placeholder="john.smith@company.com"
                />
              </div>
              
              <div>
                <Label htmlFor={`ref-phone-${reference.id}`}>Phone</Label>
                <Input
                  id={`ref-phone-${reference.id}`}
                  value={reference.phone}
                  onChange={(e) => updateReference(reference.id, 'phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
