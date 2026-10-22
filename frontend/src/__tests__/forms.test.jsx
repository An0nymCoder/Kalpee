import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ArticleFormModal from '../components/achat/ArticleFormModal'
import ObjectifFormModal from '../components/objectifs/ObjectifFormModal'
import Register from '../pages/Register'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'

describe('Formulaires et calculs en direct', () => {
  it('calcule en direct le total de l’article (Quantité × Prix unitaire) en FCFA', async () => {
    const user = userEvent.setup()
    const onSubmitArticle = vi.fn().mockResolvedValue({})

    render(
      <ArticleFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmitArticle={onSubmitArticle}
      />
    )

    expect(screen.getByTestId('article-live-total')).toHaveTextContent('0 FCFA')

    const nomInput = screen.getByLabelText(/^Nom$/i)
    const qtyInput = screen.getByLabelText(/Quantité/i)
    const priceInput = screen.getByLabelText(/Prix unitaire/i)

    await user.clear(nomInput)
    await user.type(nomInput, 'Jean noir')
    await user.clear(qtyInput)
    await user.type(qtyInput, '2')
    await user.clear(priceInput)
    await user.type(priceInput, '15000')

    expect(screen.getByTestId('article-live-total')).toHaveTextContent('30 000 FCFA')

    await user.click(screen.getByRole('button', { name: /Ajouter l'article/i }))

    await waitFor(() => {
      expect(onSubmitArticle).toHaveBeenCalledTimes(1)
    })
    expect(onSubmitArticle.mock.calls[0][0]).toMatchObject({
      nom: 'Jean noir',
      quantite: 2,
      prixUnitaire: 15000,
    })
  })

  it('affiche les erreurs de validation sur le formulaire Objectif si le montant initial dépasse la cible', async () => {
    const user = userEvent.setup()
    const onSubmitObjectif = vi.fn()

    render(
      <ObjectifFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmitObjectif={onSubmitObjectif}
      />
    )

    await user.type(screen.getByLabelText(/Nom de l'objectif/i), 'Mon PC')
    await user.type(screen.getByLabelText(/Montant cible/i), '100000')
    const initInput = screen.getByLabelText(/Déjà épargné/i)
    await user.clear(initInput)
    await user.type(initInput, '150000')
    await user.type(screen.getByLabelText(/Date cible/i), '2026-12-31')

    await user.click(screen.getByRole('button', { name: /Créer l'objectif/i }))

    expect(
      await screen.findByText(/Le montant déjà épargné ne peut pas dépasser le montant cible/i)
    ).toBeInTheDocument()
    expect(onSubmitObjectif).not.toHaveBeenCalled()
  })

  it('affiche le bouton Continuer avec Google et valide les champs sur la page Inscription', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider skipInitialFetch={true}>
            <Register />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('button', { name: /Continuer avec Google/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /S'inscrire/i }))

    expect(await screen.findByText(/Le prénom est obligatoire/i)).toBeInTheDocument()
    expect(await screen.findByText(/Le nom est obligatoire/i)).toBeInTheDocument()
  })
})
