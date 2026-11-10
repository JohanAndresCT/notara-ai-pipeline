from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Comment


@receiver(post_delete, sender=Comment)
def delete_voice_comment_audio(sender, instance, **kwargs):
    """Voice-comment audio lives only while its comment exists (DEC-214, DEC-237).

    Runs for direct deletes and for cascades (score or administrative user deletion)."""
    if instance.audio:
        name = instance.audio.name
        storage = instance.audio.storage
        transaction.on_commit(lambda: storage.delete(name))
