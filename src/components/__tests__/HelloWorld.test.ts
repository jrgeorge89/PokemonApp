import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('is a Vue instance', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Test' } })
    expect(wrapper.vm).toBeTruthy()
  })

  it('has the correct props', () => {
    const msg = 'Test Message'
    const wrapper = mount(HelloWorld, { props: { msg } })
    expect(wrapper.props().msg).toBe(msg)
  })
})