import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import PokemonCard from '../PokemonCard.vue'
import type { Pokemon } from '../../../types/pokemon.types'

/**
 * Datos de prueba para un Pokémon con múltiples tipos
 */
const mockPokemon = {
  id: 6,
  name: 'charizard',
  height: 17,
  weight: 905,
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    other: {
      'official-artwork': {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
      },
      home: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/6.png'
      }
    }
  },
  types: [
    {
      slot: 1,
      type: {
        name: 'fire',
        url: 'https://pokeapi.co/api/v2/type/10/'
      }
    },
    {
      slot: 2,
      type: {
        name: 'flying',
        url: 'https://pokeapi.co/api/v2/type/3/'
      }
    }
  ],
  abilities: [
    {
      slot: 1,
      ability: {
        name: 'blaze',
        url: 'https://pokeapi.co/api/v2/ability/66/'
      },
      is_hidden: false
    }
  ],
  stats: [
    {
      base_stat: 78,
      effort: 0,
      stat: {
        name: 'hp',
        url: 'https://pokeapi.co/api/v2/stat/1/'
      }
    }
  ],
  species: {
    name: 'charizard',
    url: 'https://pokeapi.co/api/v2/pokemon-species/6/'
  },
  base_experience: 267
} as Pokemon

/**
 * Pokémon de prueba con un solo tipo
 */
const mockSingleTypePokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    other: {
      'official-artwork': {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
      }
    }
  },
  types: [
    {
      slot: 1,
      type: {
        name: 'electric',
        url: 'https://pokeapi.co/api/v2/type/13/'
      }
    }
  ],
  abilities: [
    {
      slot: 1,
      ability: {
        name: 'static',
        url: 'https://pokeapi.co/api/v2/ability/9/'
      },
      is_hidden: false
    }
  ],
  stats: [
    {
      base_stat: 35,
      effort: 0,
      stat: {
        name: 'hp',
        url: 'https://pokeapi.co/api/v2/stat/1/'
      }
    }
  ],
  species: {
    name: 'pikachu',
    url: 'https://pokeapi.co/api/v2/pokemon-species/25/'
  },
  base_experience: 112
} as Pokemon

describe('PokemonCard', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    // Limpiar el wrapper antes de cada test
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('renders pokemon information correctly', () => {
    beforeEach(() => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })
    })

    it('should display the pokemon name correctly', () => {
      const pokemonName = wrapper.find('.pokemon-name')
      expect(pokemonName.exists()).toBe(true)
      expect(pokemonName.text()).toBe('charizard')
    })

    it('should display the pokemon number with correct formatting', () => {
      const pokemonNumber = wrapper.find('.pokemon-number')
      expect(pokemonNumber.exists()).toBe(true)
      expect(pokemonNumber.text()).toBe('#006')
    })

    it('should display the pokemon image with correct src', () => {
      const pokemonImage = wrapper.find('.pokemon-image')
      expect(pokemonImage.exists()).toBe(true)
      expect(pokemonImage.attributes('src')).toBe(mockPokemon.sprites.other?.['official-artwork']?.front_default)
      expect(pokemonImage.attributes('alt')).toBe(mockPokemon.name)
    })

    it('should show placeholder when image fails to load', async () => {
      // Simular error en la imagen
      const img = wrapper.find('.pokemon-image')
      await img.trigger('error')

      const placeholder = wrapper.find('.pokemon-placeholder')
      expect(placeholder.exists()).toBe(true)
    })

    it('should display correct padded number for single digit', () => {
      const singleDigitWrapper = mount(PokemonCard, {
        props: {
          pokemon: { ...mockPokemon, id: 1 } as Pokemon,
          isFavorite: false
        }
      })

      const pokemonNumber = singleDigitWrapper.find('.pokemon-number')
      expect(pokemonNumber.text()).toBe('#001')
      
      singleDigitWrapper.unmount()
    })

    it('should display correct padded number for double digit', () => {
      const doubleDigitWrapper = mount(PokemonCard, {
        props: {
          pokemon: { ...mockPokemon, id: 25 } as Pokemon,
          isFavorite: false
        }
      })

      const pokemonNumber = doubleDigitWrapper.find('.pokemon-number')
      expect(pokemonNumber.text()).toBe('#025')
      
      doubleDigitWrapper.unmount()
    })
  })

  describe('displays all pokemon types as badges', () => {
    it('should display all types for multi-type pokemon', () => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })

      const typesBadges = wrapper.findAll('.type-badge')
      
      expect(typesBadges).toHaveLength(2)
      expect(typesBadges[0]?.text()).toBe('fire')
      expect(typesBadges[1]?.text()).toBe('flying')
    })

    it('should display single type for single-type pokemon', () => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockSingleTypePokemon,
          isFavorite: false
        }
      })

      const typesBadges = wrapper.findAll('.type-badge')
      
      expect(typesBadges).toHaveLength(1)
      expect(typesBadges[0]?.text()).toBe('electric')
    })

    it('should preserve type order based on slot', () => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })

      const typesBadges = wrapper.findAll('.type-badge')
      
      // fire tiene slot 1, flying tiene slot 2
      expect(typesBadges[0]?.text()).toBe('fire')
      expect(typesBadges[1]?.text()).toBe('flying')
    })
  })

  describe('emits click event when card is clicked', () => {
    beforeEach(() => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })
    })

    it('should emit click event when pokemon card is clicked', async () => {
      const pokemonCard = wrapper.find('.pokemon-card')
      
      await pokemonCard.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([mockPokemon])
    })

    it('should emit toggleFavorite event when favorite button is clicked', async () => {
      const favoriteButton = wrapper.find('.favorite-button')
      
      await favoriteButton.trigger('click')
      
      expect(wrapper.emitted('toggleFavorite')).toBeTruthy()
      expect(wrapper.emitted('toggleFavorite')![0]).toEqual([mockPokemon])
    })

    it('should stop propagation when favorite button is clicked', async () => {
      const favoriteButton = wrapper.find('.favorite-button')
      
      await favoriteButton.trigger('click')
      
      // El evento click no debe haberse emitido desde el card principal
      expect(wrapper.emitted('click')).toBeFalsy()
      expect(wrapper.emitted('toggleFavorite')).toBeTruthy()
    })

    it('should emit correct pokemon data in click event', async () => {
      const pokemonCard = wrapper.find('.pokemon-card')
      
      await pokemonCard.trigger('click')
      
      const emittedEvent = wrapper.emitted('click')?.[0]?.[0] as Pokemon
      expect(emittedEvent.id).toBe(mockPokemon.id)
      expect(emittedEvent.name).toBe(mockPokemon.name)
      expect(emittedEvent.types).toEqual(mockPokemon.types)
    })
  })

  describe('applies correct type colors', () => {
    beforeEach(() => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })
    })

    it('should apply correct CSS classes for fire type', () => {
      const fireTypeBadge = wrapper.findAll('.type-badge')[0]
      const classes = fireTypeBadge?.classes().join(' ') || ''
      
      expect(classes).toContain('bg-red-500')
      expect(classes).toContain('text-white')
    })

    it('should apply correct CSS classes for flying type', () => {
      const flyingTypeBadge = wrapper.findAll('.type-badge')[1]
      const classes = flyingTypeBadge?.classes().join(' ') || ''
      
      expect(classes).toContain('bg-indigo-400')
      expect(classes).toContain('text-white')
    })

    it('should apply correct CSS classes for electric type', () => {
      const electricWrapper = mount(PokemonCard, {
        props: {
          pokemon: mockSingleTypePokemon,
          isFavorite: false
        }
      })

      const electricTypeBadge = electricWrapper.find('.type-badge')
      const classes = electricTypeBadge.classes().join(' ')
      
      expect(classes).toContain('bg-yellow-400')
      expect(classes).toContain('text-gray-900')
      
      electricWrapper.unmount()
    })

    it('should apply default colors for unknown type', () => {
      const unknownTypePokemon = {
        ...mockPokemon,
        types: [
          {
            slot: 1,
            type: {
              name: 'unknown-type',
              url: 'https://pokeapi.co/api/v2/type/999/'
            }
          }
        ]
      } as Pokemon

      const unknownWrapper = mount(PokemonCard, {
        props: {
          pokemon: unknownTypePokemon,
          isFavorite: false
        }
      })

      const typeBadge = unknownWrapper.find('.type-badge')
      const classes = typeBadge.classes().join(' ')
      
      expect(classes).toContain('bg-gray-400')
      expect(classes).toContain('text-white')
      
      unknownWrapper.unmount()
    })

    it('should include hover effects in type badge classes', () => {
      const typeBadge = wrapper.find('.type-badge')
      const classes = typeBadge.classes()
      
      expect(classes).toContain('hover:scale-110')
      expect(classes).toContain('transition-all')
    })
  })

  describe('favorite functionality', () => {
    it('should display correct classes when pokemon is favorite', () => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: true
        }
      })

      const favoriteButton = wrapper.find('.favorite-button')
      const classes = favoriteButton.classes().join(' ')
      
      expect(classes).toContain('bg-red-500')
      expect(classes).toContain('text-white')
    })

    it('should display correct classes when pokemon is not favorite', () => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })

      const favoriteButton = wrapper.find('.favorite-button')
      const classes = favoriteButton.classes().join(' ')
      
      expect(classes).toContain('bg-white/80')
      expect(classes).toContain('text-gray-600')
    })

    it('should have correct title attribute for favorite button', () => {
      // Test cuando es favorito
      const favoriteWrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: true
        }
      })

      let favoriteButton = favoriteWrapper.find('.favorite-button')
      expect(favoriteButton.attributes('title')).toBe('Quitar de favoritos')
      
      favoriteWrapper.unmount()

      // Test cuando no es favorito
      const nonFavoriteWrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })

      favoriteButton = nonFavoriteWrapper.find('.favorite-button')
      expect(favoriteButton.attributes('title')).toBe('Agregar a favoritos')
      
      nonFavoriteWrapper.unmount()
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })
    })

    it('should have proper alt text for pokemon image', () => {
      const pokemonImage = wrapper.find('.pokemon-image')
      expect(pokemonImage.attributes('alt')).toBe(mockPokemon.name)
    })

    it('should have loading attribute for performance', () => {
      const pokemonImage = wrapper.find('.pokemon-image')
      expect(pokemonImage.attributes('loading')).toBe('lazy')
    })

    it('should have proper title for favorite button', () => {
      const favoriteButton = wrapper.find('.favorite-button')
      expect(favoriteButton.attributes('title')).toBeTruthy()
    })
  })

  describe('responsive behavior', () => {
    beforeEach(() => {
      wrapper = mount(PokemonCard, {
        props: {
          pokemon: mockPokemon,
          isFavorite: false
        }
      })
    })

    it('should have proper card structure', () => {
      const card = wrapper.find('.pokemon-card')
      const imageContainer = wrapper.find('.pokemon-image-container')
      const infoContainer = wrapper.find('.pokemon-info')
      
      expect(card.exists()).toBe(true)
      expect(imageContainer.exists()).toBe(true)
      expect(infoContainer.exists()).toBe(true)
    })

    it('should include responsive and interactive classes', () => {
      const card = wrapper.find('.pokemon-card')
      const classes = card.classes()
      
      expect(classes).toContain('cursor-pointer')
      expect(classes).toContain('transition-all')
      expect(classes).toContain('hover:shadow-xl')
    })
  })
})