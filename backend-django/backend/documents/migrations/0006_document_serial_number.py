from django.db import migrations, models
import uuid


def generate_serial_numbers(apps, schema_editor):
    # Get the Document model
    Document = apps.get_model('documents', 'Document')
    # Iterate through all existing documents
    for document in Document.objects.all():
        # Assign a unique serial number
        document.serial_number = f"SN-{uuid.uuid4().hex[:12].upper()}"
        document.save()


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0005_remove_document_stamp_data_document_stamp'),
    ]

    operations = [
        # Step 1: Add the field with null=True temporarily
        migrations.AddField(
            model_name='document',
            name='serial_number',
            field=models.CharField(max_length=50, unique=True, editable=False, blank=True, null=True),
        ),
        # Step 2: Populate the field with unique values
        migrations.RunPython(generate_serial_numbers),
        # Step 3: Alter the field to remove null=True and enforce the UNIQUE constraint
        migrations.AlterField(
            model_name='document',
            name='serial_number',
            field=models.CharField(max_length=50, unique=True, editable=False, blank=True),
        ),
    ]
