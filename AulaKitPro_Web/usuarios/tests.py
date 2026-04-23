from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class ElectricityGameTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.url = reverse('usuarios:jeu_electricite')

    def test_game_view_requires_login(self):
        """Test that the game view redirects to login if user is not authenticated."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)

    def test_game_view_accessible_after_login(self):
        """Test that the game view is accessible for logged-in users."""
        self.client.login(username='testuser', password='password123')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'usuarios/jeu_electricite.html')
        self.assertContains(response, "Labo d'Électricité Interactif")
