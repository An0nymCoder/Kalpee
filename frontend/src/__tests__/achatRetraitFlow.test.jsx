import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AchatDetail from '../pages/AchatDetail'
import { ToastProvider } from '../context/ToastContext'
import { achatService } from '../services/achatService'
import { articleService } from '../services/articleService'
import { tirelireService } from '../services/tirelireService'
import { objectifService } from '../services/objectifService'

vi.mock('../services/achatService', () => ({
  achatService: {
    getById: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('../services/articleService', () => ({
  articleService: {
    updateStatut: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    uploadPhoto: vi.fn(),
    deletePhoto: vi.fn(),
  },
}))

vi.mock('../services/tirelireService', () => ({
  tirelireService: {
    retirer: vi.fn(),
  },
}))

vi.mock('../services/objectifService', () => ({
  objectifService: {
    list: vi.fn(),
  },
}))

const mockAchatInitial = {
  id: 1,
  nom: 'Habits',
  description: 'Vêtements pour les vacances',
  priorite: 'URGENT',
  categorie: 'VETEMENTS',
  dateLimite: '2026-09-15',
  statut: 'EN_COURS',
  nombreArticles: 1,
  nombreArticlesAchetes: 0,
  total: 30000,
  dejaAchete: 0,
  resteAAcheter: 30000,
  progression: 0,
  articles: [
    {
      id: 10,
      achatId: 1,
      nom: 'Jean noir',
      description: 'Jean noir coupe droite',
      quantite: 2,
      prixUnitaire: 15000,
      total: 30000,
      magasin: 'Zara',
      statut: 'A_ACHETER',
      aPhoto: false,
      photoUrl: null,
    },
  ],
}

const mockAchatAfterBought = {
  ...mockAchatInitial,
  statut: 'TERMINE',
  nombreArticlesAchetes: 1,
  dejaAchete: 30000,
  resteAAcheter: 0,
  progression: 100,
  articles: [
    {
      ...mockAchatInitial.articles[0],
      statut: 'ACHETE',
    },
  ],
}

describe('Flux clé 2 : Article marqué Acheté -> Modale de retrait proposée', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    objectifService.list.mockResolvedValue([])
  })

  it('propose un retrait de la tirelire quand un article passe à ACHETE et permet de confirmer le retrait', async () => {
    const user = userEvent.setup()

    achatService.getById
      .mockResolvedValueOnce(mockAchatInitial)
      .mockResolvedValueOnce(mockAchatAfterBought)

    articleService.updateStatut.mockResolvedValue({
      article: mockAchatAfterBought.articles[0],
      retraitSuggere: {
        montant: 30000,
        motif: 'Achat : Jean noir (Habits)',
        articleId: 10,
      },
    })

    tirelireService.retirer.mockResolvedValue({
      id: 99,
      type: 'RETRAIT',
      montant: 30000,
      motif: 'Achat : Jean noir (Habits)',
    })

    render(
      <MemoryRouter initialEntries={['/achats/1']}>
        <ToastProvider>
          <Routes>
            <Route path="/achats/:id" element={<AchatDetail />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    // Attendre le chargement de l'article
    expect(await screen.findByText('Jean noir')).toBeInTheDocument()

    // Changer le statut en ACHETE
    const selectStatut = screen.getByLabelText(/Statut de Jean noir/i)
    await user.selectOptions(selectStatut, 'ACHETE')

    // Vérifier que l'appel PATCH a eu lieu
    expect(articleService.updateStatut).toHaveBeenCalledWith(10, 'ACHETE')

    // La modale de retrait suggéré doit s'ouvrir avec le montant et le motif pré-remplis
    expect(
      await screen.findByText(/Retirer 30 000 FCFA de ta tirelire \?/i)
    ).toBeInTheDocument()

    const motifInput = screen.getByLabelText(/Motif/i)
    expect(motifInput).toHaveValue('Achat : Jean noir (Habits)')

    // Confirmer le retrait
    await user.click(screen.getByRole('button', { name: /Confirmer le retrait/i }))

    await waitFor(() => {
      expect(tirelireService.retirer).toHaveBeenCalledWith({
        montant: 30000,
        motif: 'Achat : Jean noir (Habits)',
        objectifId: null,
        articleId: 10,
      })
    })
  })

  it('permet de refuser le retrait proposé tout en gardant l’article Acheté, et affiche une erreur 422 si solde insuffisant', async () => {
    const user = userEvent.setup()

    achatService.getById
      .mockResolvedValueOnce(mockAchatInitial)
      .mockResolvedValueOnce(mockAchatAfterBought)

    articleService.updateStatut.mockResolvedValue({
      article: mockAchatAfterBought.articles[0],
      retraitSuggere: {
        montant: 30000,
        motif: 'Achat : Jean noir (Habits)',
        articleId: 10,
      },
    })

    tirelireService.retirer.mockRejectedValueOnce({
      response: {
        status: 422,
        data: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Solde insuffisant dans ta tirelire (disponible : 5 000 FCFA).',
        },
      },
    })

    render(
      <MemoryRouter initialEntries={['/achats/1']}>
        <ToastProvider>
          <Routes>
            <Route path="/achats/:id" element={<AchatDetail />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText('Jean noir')).toBeInTheDocument()

    const selectStatut = screen.getByLabelText(/Statut de Jean noir/i)
    await user.selectOptions(selectStatut, 'ACHETE')

    expect(
      await screen.findByText(/Retirer 30 000 FCFA de ta tirelire \?/i)
    ).toBeInTheDocument()

    // Tentative de retrait avec solde insuffisant -> message explicatif affiché
    await user.click(screen.getByRole('button', { name: /Confirmer le retrait/i }))

    expect(
      await screen.findByText(/Solde insuffisant dans ta tirelire/i)
    ).toBeInTheDocument()

    // L'utilisateur choisit finalement "Non, garder sans retirer"
    await user.click(
      screen.getByRole('button', { name: /Non, garder sans retirer/i })
    )

    await waitFor(() => {
      expect(
        screen.queryByText(/Retirer 30 000 FCFA de ta tirelire \?/i)
      ).not.toBeInTheDocument()
    })
  })
})
